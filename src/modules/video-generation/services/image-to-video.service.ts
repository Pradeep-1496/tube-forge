import { Injectable } from '@nestjs/common';
import { spawn } from 'child_process';
import { join } from 'path';
import { existsSync, mkdirSync, writeFileSync, unlinkSync } from 'fs';

@Injectable()
export class ImageToVideoService {
  async stitch(imagePaths: string[], durationSeconds: number, outputPath: string): Promise<void> {
    const workDir = join(process.cwd(), 'temp-video-work');
    const outputDir = join(process.cwd(), 'output-videos');
    if (!existsSync(workDir)) mkdirSync(workDir, { recursive: true });
    if (!existsSync(outputDir)) mkdirSync(outputDir, { recursive: true });

    return new Promise((resolve, reject) => {
      const numFrames = imagePaths.length;
      if (numFrames === 0) {
        reject(new Error('No frames to stitch'));
        return;
      }

      const perFrame = Number((durationSeconds / numFrames).toFixed(6));
      const segments: string[] = [];
      let completed = 0;

      for (let i = 0; i < numFrames; i++) {
        const segmentPath = join(workDir, `seg-${Date.now()}-${i}.mp4`);
        segments.push(segmentPath);

        const args: string[] = [
          '-loop', '1', '-i', imagePaths[i],
          '-c:v', 'libx264', '-pix_fmt', 'yuv420p',
          '-vf', 'scale=1080:1920,fps=30',
          '-t', String(perFrame), '-y', segmentPath,
        ];

        const ffmpeg = spawn('ffmpeg', args);

        ffmpeg.on('close', (code) => {
          if (code !== 0) {
            reject(new Error(`Segment ${i} failed with code ${code}`));
            return;
          }
          completed++;
          if (completed === numFrames) {
            this.concatSegments(segments, outputPath)
              .then(resolve)
              .catch(reject);
          }
        });

        ffmpeg.on('error', (err) => reject(err));
      }
    });
  }

  private concatSegments(segments: string[], outputPath: string): Promise<void> {
    const listPath = join(process.cwd(), 'concat-list.txt');
    writeFileSync(listPath, segments.map((p) => `file '${p}'`).join('\n'));

    return new Promise((resolve, reject) => {
      const ffmpeg = spawn('ffmpeg', [
        '-f', 'concat', '-safe', '0', '-i', listPath,
        '-c', 'copy', '-y', outputPath,
      ]);

      let stderr = '';
      ffmpeg.stderr.on('data', (data) => { stderr += data.toString(); });

      ffmpeg.on('close', (code) => {
        unlinkSync(listPath);
        if (code === 0) {
          for (const s of segments) {
            try { unlinkSync(s); } catch {}
          }
          resolve();
        } else {
          reject(new Error(`FFmpeg concat failed: ${stderr}`));
        }
      });

      ffmpeg.on('error', (err) => {
        unlinkSync(listPath);
        reject(err);
      });
    });
  }
}
