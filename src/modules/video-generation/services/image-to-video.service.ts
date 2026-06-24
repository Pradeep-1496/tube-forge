import { Injectable } from '@nestjs/common';
import { spawn } from 'child_process';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';

@Injectable()
export class ImageToVideoService {
  async stitch(
    imagePath: string,
    durationSeconds: number,
    outputPath: string,
    audioPath?: string,
  ): Promise<void> {
    const outputDir = join(outputPath, '..');
    if (!existsSync(outputDir)) {
      mkdirSync(outputDir, { recursive: true });
    }

    return new Promise((resolve, reject) => {
      const args: string[] = [];

      if (audioPath) {
        args.push('-loop', '1', '-i', imagePath, '-i', audioPath);
      } else {
        args.push('-loop', '1', '-i', imagePath);
      }

      args.push(
        '-c:v',
        'libx264',
        '-pix_fmt',
        'yuv420p',
        '-vf',
        'scale=1080:1920,fps=30',
        '-t',
        String(durationSeconds),
        '-y',
        outputPath,
      );

      if (audioPath) {
        args.push('-c:a', 'aac', '-shortest');
      }

      const ffmpeg = spawn('ffmpeg', args);

      ffmpeg.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`FFmpeg failed with code ${code}`));
          return;
        }
        resolve();
      });

      ffmpeg.on('error', (err) => reject(err));
    });
  }
}
