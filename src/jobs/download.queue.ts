import { Queue } from 'bullmq';
import IORedis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const redisOptions = {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    maxRetriesPerRequest: null,
};

export const connection = new IORedis(redisOptions);

export const downloadQueue = new Queue('video-download', { connection });

export async function addDownloadTask(url: string, title?: string) {
    const job = await downloadQueue.add('download-job', { url, title });
    return job.id;
}
