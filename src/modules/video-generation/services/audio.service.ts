import { Injectable } from '@nestjs/common';
import { spawn } from 'child_process';
import { join } from 'path';
import { existsSync, mkdirSync, unlinkSync } from 'fs';

@Injectable()
export class AudioService {
  private readonly outputDir: string;

  constructor() {
    this.outputDir = join(process.cwd(), 'tmp-audio');
    if (!existsSync(this.outputDir)) {
      mkdirSync(this.outputDir, { recursive: true });
    }
  }

  async prepareAudio(
    audioPath: string | undefined,
    targetDuration: number = 15,
  ): Promise<string | null> {
    if (!audioPath || !existsSync(audioPath)) {
      return null;
    }

    const duration = await this.getAudioDuration(audioPath);

    if (duration === null) {
      return null;
    }

    const outputPath = join(
      this.outputDir,
      `audio-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.mp3`,
    );

    if (duration <= targetDuration) {
      await this.loopAudio(audioPath, targetDuration, outputPath);
    } else {
      await this.trimAudio(audioPath, targetDuration, outputPath);
    }

    return outputPath;
  }

  private getAudioDuration(audioPath: string): Promise<number | null> {
    return new Promise((resolve) => {
      const args: string[] = [
        '-v',
        'error',
        '-show_entries',
        'format=duration',
        '-of',
        'default=noprint_wrappers=1:nokey=1',
        audioPath,
      ];

      const ffprobe = spawn('ffprobe', args);
      let stdout = '';

      ffprobe.stdout.on('data', (data) => {
        stdout += String(data);
      });

      ffprobe.on('close', (code) => {
        if (code !== 0) {
          resolve(null);
          return;
        }

        const trimmed = stdout.trim();
        const parsed = parseFloat(trimmed);
        if (isNaN(parsed) || parsed <= 0) {
          resolve(null);
          return;
        }

        resolve(parsed);
      });

      ffprobe.on('error', () => resolve(null));
    });
  }

  private loopAudio(
    inputPath: string,
    targetDuration: number,
    outputPath: string,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const args: string[] = [
        '-stream_loop',
        '-1',
        '-i',
        inputPath,
        '-t',
        String(targetDuration),
        '-c',
        'copy',
        '-y',
        outputPath,
      ];

      const ffmpeg = spawn('ffmpeg', args);

      ffmpeg.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`FFmpeg loop failed with code ${code}`));
          return;
        }
        resolve();
      });

      ffmpeg.on('error', (err) => reject(err));
    });
  }

  private trimAudio(
    inputPath: string,
    targetDuration: number,
    outputPath: string,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const args: string[] = [
        '-i',
        inputPath,
        '-t',
        String(targetDuration),
        '-c',
        'copy',
        '-y',
        outputPath,
      ];

      const ffmpeg = spawn('ffmpeg', args);

      ffmpeg.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`FFmpeg trim failed with code ${code}`));
          return;
        }
        resolve();
      });

      ffmpeg.on('error', (err) => reject(err));
    });
  }

  cleanupTemp(path: string | null): void {
    if (path && existsSync(path)) {
      try {
        unlinkSync(path);
      } catch {
        // ignore cleanup errors
      }
    }
  }
}
