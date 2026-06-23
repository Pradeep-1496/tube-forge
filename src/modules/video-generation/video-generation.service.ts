import { Injectable, NotFoundException } from '@nestjs/common';
import { Metadata } from '../../common/models/metadata.model';
import { CreateVideoGenerationDto } from './dto/create-video-generation.dto';
import { UpdateVideoGenerationDto } from './dto/update-video-generation.dto';
import { spawn } from 'child_process';
import {
  existsSync,
  mkdirSync,
  unlinkSync,
  writeFileSync,
  copyFileSync,
  readdirSync,
  rmSync,
} from 'fs';
import { join } from 'path';
import puppeteer from 'puppeteer';

@Injectable()
export class VideoGenerationService {
  async create(
    createVideoGenerationDto: CreateVideoGenerationDto,
  ): Promise<Metadata> {
    const metadata = await Metadata.create(
      createVideoGenerationDto as Partial<Metadata>,
    );
    return metadata;
  }

  async findAll(): Promise<Metadata[]> {
    return Metadata.findAll();
  }

  async findOne(id: string): Promise<Metadata> {
    const metadata = await Metadata.findByPk(id, { raw: true });
    if (!metadata) {
      throw new NotFoundException(`Metadata with ID ${id} not found`);
    }
    return metadata;
  }

  async update(
    id: string,
    updateVideoGenerationDto: UpdateVideoGenerationDto,
  ): Promise<Metadata> {
    const metadata = await this.findOne(id);
    await metadata.update(updateVideoGenerationDto);
    return metadata;
  }

  async remove(id: string): Promise<void> {
    const metadata = await this.findOne(id);
    await metadata.destroy();
  }

  async generateVideo(id: string): Promise<string> {
    const metadata = await this.findOne(id);
    const { title, content } = metadata;

    const outputDir = join(process.cwd(), 'output-videos');
    const thumbnailDir = join(process.cwd(), 'thumbnail');
    if (!existsSync(outputDir)) {
      mkdirSync(outputDir, { recursive: true });
    }
    if (!existsSync(thumbnailDir)) {
      mkdirSync(thumbnailDir, { recursive: true });
    }

    const chunks: { title: string; content: string }[] = [];
    const wordsPerSecond = 4;
    const totalWords = wordsPerSecond * 5;

    if (content && content.trim().length > 0) {
      const words = content.trim().split(/\s+/);
      for (let i = 0; i < words.length; i += totalWords) {
        chunks.push({
          title,
          content: words.slice(i, i + totalWords).join(' '),
        });
      }
    }

    if (chunks.length === 0) {
      chunks.push({ title, content: '' });
    }

    const framePaths: string[] = [];
    for (let i = 0; i < chunks.length; i++) {
      const framePath = join(outputDir, `frame-${Date.now()}-${i}.png`);
      framePaths.push(framePath);
      await this.renderTextToImage(
        chunks[i].title,
        chunks[i].content,
        framePath,
        i === 0,
      );
    }

    const now = new Date();
    const datePart = now.toISOString().slice(0, 10);
    const timePart = now.toISOString().slice(11, 19).replace(/:/g, '-');
    const filename = `${datePart}-${timePart}.mp4`;
    const thumbnailFilename = `${datePart}-${timePart}.png`;
    const outputPath = join(outputDir, filename);
    const thumbnailPath = join(thumbnailDir, thumbnailFilename);

    copyFileSync(framePaths[0], thumbnailPath);

    await this.stitchImagesToVideo(framePaths, 5, outputPath);

    for (const path of framePaths) {
      unlinkSync(path);
    }

    return outputPath;
  }

  private async renderTextToImage(
    title: string,
    content: string,
    outputPath: string,
    isFirstFrame: boolean,
  ): Promise<void> {
    const html = `
      <html>
        <body style="margin:0; padding:0; width:1080px; height:1920px; font-family: Arial, sans-serif; background: #1a1a2e; color: white; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; overflow: hidden;">
          <div style="font-size: ${isFirstFrame ? '56px' : '40px'}; font-weight: bold; max-width: 90%; word-wrap: break-word; line-height: 1.3; padding: 20px; margin-bottom: 20px;">
            ${title}
          </div>
          ${content ? `<div style="font-size: 32px; max-width: 90%; word-wrap: break-word; line-height: 1.3; padding: 20px;">${content}</div>` : ''}
        </body>
      </html>
    `;

    const browser = await puppeteer.launch({
      executablePath:
        'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      headless: true,
      args: ['--no-sandbox', '--disable-dev-shm-usage'],
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 1920 });
    await page.setContent(html);
    await page.screenshot({ path: outputPath, type: 'png' });
    await browser.close();
  }

  private stitchImagesToVideo(
    imagePaths: string[],
    durationSeconds: number,
    outputPath: string,
  ): Promise<void> {
    const workDir = join(process.cwd(), 'temp-video-work');
    if (!existsSync(workDir)) {
      mkdirSync(workDir, { recursive: true });
    }

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
          '-loop',
          '1',
          '-i',
          imagePaths[i],
          '-c:v',
          'libx264',
          '-pix_fmt',
          'yuv420p',
          '-vf',
          'scale=1080:1920,fps=30',
          '-t',
          String(perFrame),
          '-y',
          segmentPath,
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

        ffmpeg.on('error', (err) => {
          reject(err);
        });
      }
    });
  }

  private concatSegments(
    segments: string[],
    outputPath: string,
  ): Promise<void> {
    const listPath = join(process.cwd(), 'concat-list.txt');
    const content = segments.map((p) => `file '${p}'`).join('\n');
    writeFileSync(listPath, content);

    return new Promise((resolve, reject) => {
      const ffmpeg = spawn('ffmpeg', [
        '-f',
        'concat',
        '-safe',
        '0',
        '-i',
        listPath,
        '-c',
        'copy',
        '-y',
        outputPath,
      ]);

      let stderr = '';
      ffmpeg.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      ffmpeg.on('close', (code) => {
        unlinkSync(listPath);
        if (code === 0) {
          for (const s of segments) {
            try {
              unlinkSync(s);
            } catch {}
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
