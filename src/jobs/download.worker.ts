import { Worker, Job } from 'bullmq';
import path from 'path';
import fs from 'fs';
import { connection } from './download.queue';
import { YtDlpService } from '../services/ytdlp.service';

const DOWNLOAD_DIR = path.join(__dirname, '../../downloads');

// Ensure download directory exists
if (!fs.existsSync(DOWNLOAD_DIR)) {
    fs.mkdirSync(DOWNLOAD_DIR, { recursive: true });
}

export const downloadWorker = new Worker('video-download', async (job: Job) => {
    const { url, title } = job.data;
    console.log(`[Worker] Started downloading job ${job.id}: ${url}`);

    const outputPath = path.join(DOWNLOAD_DIR, `${job.id}.mp4`);

    try {
        const process = YtDlpService.download(url, outputPath);

        // Listen to stdout to parse progress
        process.stdout?.on('data', (data: any) => {
            const output = data.toString();
            // Example yt-dlp output format: [download]  15.2% of 100.00MiB at  1.50MiB/s ETA 00:54
            const progressMatch = output.match(/\[download\]\s+([\d\.]+)%/);
            if (progressMatch && progressMatch[1]) {
                const percent = parseFloat(progressMatch[1]);
                if (!isNaN(percent)) {
                    job.updateProgress(percent);
                }
            }
        });

        await process;

        console.log(`[Worker] Finished downloading job ${job.id}`);
        return {
            success: true,
            filePath: outputPath,
        };
    } catch (error) {
        console.error(`[Worker] Error downloading job ${job.id}:`, error);
        throw error;
    }
}, { connection, concurrency: 5 });

downloadWorker.on('completed', (job) => {
    console.log(`${job.id} has completed!`);
});

downloadWorker.on('failed', (job, err) => {
    console.log(`${job?.id} has failed with ${err.message}`);
});
