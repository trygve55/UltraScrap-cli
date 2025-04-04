import { downloadSongCover } from "./downloadSongCover.js";
import { getSongMetadata } from "./getSongMetadata.js"
import { fetchSongTxt } from "./fetchSongTxt.js"
import { mkdirSync, writeFileSync } from "node:fs"
import { fetchSongYouTubeLink } from "./fetchSongYouTubeLink.js";
import { createWriteStream } from 'node:fs'
import ytdl from "ytdl-core";
import { prompt } from "../index.js";
import { spawn } from 'child_process';

/**
 * Download asynchronously song from the database
 * Might prompt for youtube video link if it is not found
 * 
 * @param id Id of the song
 */
export const downloadSong = async (id: string | number, downloadDir: string) => {
    console.log(`Fetching song with id: ${id}`)
    const txtData = await fetchSongTxt(id);
    const metadata = getSongMetadata(txtData);

    console.log(`Song: ${metadata.TITLE} by ${metadata.ARTIST}`)

    const dirPath = `${downloadDir}/${metadata.ARTIST} - ${metadata.TITLE}`;

    mkdirSync(dirPath, {
        recursive: true,
    });

    console.log(`Created directory ${dirPath}`);

    writeFileSync(`${dirPath}/song.txt`, metadata.raw, {
        encoding: 'utf-8'
    })
    console.log('Saved lyrics')


    await downloadSongCover(id, dirPath, metadata.COVER);
    console.log('Downloaded cover image');


    let youtubeLink = await fetchSongYouTubeLink(id);
    if (youtubeLink == null) {
        console.warn('Youtube link not found');
    } else {
        console.log(`Youtube link found: ${youtubeLink}`)
    }

    if (youtubeLink == null) {
        youtubeLink = prompt('Enter youtube link manually: ');
    }

    await rawDownload(youtubeLink, dirPath, metadata.MP3, metadata.VIDEO)

    console.log('Finished');
}


/**
 * Download both video and audio from link and save them in directory with provided names
 * 
 * @param link Link to video
 * @param dirPath Directory path
 * @param audioFilename Filename of the audio
 * @param videoFilename Filename of the video
 */
const rawDownload = async (link: string, dirPath: string, audioFilename: string, videoFilename: string) => {
    console.log('Starting to download video and audio')

    console.log('Downloading audio file');
    await promiseDownload(link, dirPath, audioFilename, '-x --audio-format mp3 --audio-quality 0').catch(() => {
        console.log('Error during downloading audio');
    })
    console.log('Downloaded audio file');

    console.log('Downloading video file');
    await promiseDownload(link, dirPath, videoFilename, '-S res,ext:mp4:m4a --recode mp4').catch(() => {
        console.log('Error during downloading video');
    })
    console.log('Downloaded video file');
}


/**
 * YTDL download/write stream wrapped in promise
 * 
 * @param link Link to youtube video
 * @param dirPath Directory path
 * @param filename Filename to save
 * @param options YTDL download options
 * @returns True if successful, false if there was an error
 */
const promiseDownload = (link: string, dirPath: string, filename: string, options: string): Promise<boolean> => {
    return new Promise((resolve, reject) => {
        let args: string[] = ["-o", `${dirPath}/${filename}`, link]
        let option_args: string[] = options.split(" ");
        let all_args: string[] = option_args.concat(args);
        
        console.log('yt-dlp ' + all_args.join(' '));
        let child = spawn("yt-dlp", all_args);
        console.log('Downloading file');
        
        child.stdout.pipe(process.stdout);
        child.stderr.pipe(process.stderr);
        child.on('close', (code: any) => {
            console.log(`child process exited with code ${code}`);
            resolve(true);
        });
    })
}