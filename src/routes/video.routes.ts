import { Router, Request, Response } from 'express';
import { addDownloadTask, downloadQueue } from '../jobs/download.queue';
import { YtDlpService } from '../services/ytdlp.service';
import fs from 'fs';
import path from 'path';

const router = Router();

// POST /api/video/download
router.post('/download', async (req: Request, res: Response): Promise<any> => {
    const { url } = req.body;

    if (!url) {
        return res.status(400).json({ error: 'URL is required' });
    }

    try {
        // Optionally fetch info first (could be slow, commented out for now)
        // const info = await YtDlpService.getVideoInfo(url);
        // const title = info.title;

        // Add task to queue
        const jobId = await addDownloadTask(url);
        res.json({ message: 'Download task created', taskId: jobId });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/video/task/:id
router.get('/task/:id', async (req: Request, res: Response): Promise<any> => {
    const { id } = req.params;

    try {
        const job = await downloadQueue.getJob(id as string);
        if (!job) {
            return res.status(404).json({ error: 'Task not found' });
        }

        const state = await job.getState();
        const progress = job.progress;

        res.json({
            taskId: job.id,
            state,
            progress,
            finishedOn: job.finishedOn,
            failedReason: job.failedReason
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/video/stream/:id
router.get('/stream/:id', (req: Request, res: Response): any => {
    const { id } = req.params;
    const filePath = path.join(__dirname, '../../downloads', `${id}.mp4`);

    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'Video file not found or still downloading' });
    }

    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const range = req.headers.range as string | undefined;

    if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

        // Handle parsing errors or out of bounds
        if (start >= fileSize) {
            res.status(416).send('Requested range not satisfiable\n' + start + ' >= ' + fileSize);
            return;
        }

        const chunksize = (end - start) + 1;
        const file = fs.createReadStream(filePath, { start, end });
        const head = {
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunksize,
            'Content-Type': 'video/mp4',
        };

        res.writeHead(206, head);
        file.pipe(res);
    } else {
        // No range request, return the entire file
        const head = {
            'Content-Length': fileSize,
            'Content-Type': 'video/mp4',
        };
        res.writeHead(200, head);
        fs.createReadStream(filePath).pipe(res);
    }
});

export default router;
