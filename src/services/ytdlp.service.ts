import youtubeDl from 'yt-dlp-exec';

export class YtDlpService {
    /**
     * Get video metadata without downloading
     */
    static async getVideoInfo(url: string) {
        try {
            const info = await youtubeDl(url, {
                dumpJson: true,
                noCheckCertificate: true,
                noWarnings: true,
                preferFreeFormats: true,
                noPlaylist: true,
                addHeader: ['user-agent:Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'] as any
            });
            return info;
        } catch (error) {
            console.error('Error fetching video info:', error);
            throw error;
        }
    }

    /**
     * Download the video. This is usually called by the worker.
     */
    static download(url: string, outputPath: string) {
        // We return the child process so the worker can listen to its stdout/stderr
        const ytDlpExec = require('yt-dlp-exec').exec;
        return ytDlpExec(url, {
            output: outputPath,
            format: 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best',
            mergeOutputFormat: 'mp4',
            noCheckCertificate: true,
            noWarnings: true,
            noPlaylist: true,
            addHeader: ['user-agent:Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36']
        });
    }
}
