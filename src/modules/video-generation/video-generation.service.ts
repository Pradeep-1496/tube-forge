import { Injectable, NotFoundException } from '@nestjs/common';
import { Metadata } from '../../common/models/metadata.model';
import { join } from 'path';
import { existsSync, mkdirSync, copyFileSync, unlinkSync } from 'fs';
import { HtmlToImageService } from './services/html-to-image.service';
import { ImageToVideoService } from './services/image-to-video.service';

@Injectable()
export class VideoGenerationService {
  constructor(
    private readonly htmlToImageService: HtmlToImageService,
    private readonly imageToVideoService: ImageToVideoService,
  ) {}

  async generateVideo(id: string): Promise<string> {
    const metadata = await Metadata.findByPk(id, { raw: true });
    if (!metadata) {
      throw new NotFoundException(`Metadata with ID ${id} not found`);
    }

    const { title, content } = metadata;

    const outputDir = join(process.cwd(), 'output-videos');
    const thumbnailDir = join(process.cwd(), 'thumbnail');
    if (!existsSync(outputDir)) {
      mkdirSync(outputDir, { recursive: true });
    }
    if (!existsSync(thumbnailDir)) {
      mkdirSync(thumbnailDir, { recursive: true });
    }

    const framePath = join(outputDir, `frame-${Date.now()}.png`);

    const html = this.htmlToImageService.buildVideoHtml(title, content, true);
    await this.htmlToImageService.render(html, framePath);

    const now = new Date();
    const datePart = now.toISOString().slice(0, 10);

    const filename = `${datePart}-${Date.now()}.mp4`;
    const thumbnailFilename = `${datePart}-${Date.now()}.png`;
    const outputPath = join(outputDir, filename);
    const thumbnailPath = join(thumbnailDir, thumbnailFilename);

    copyFileSync(framePath, thumbnailPath);

    await this.imageToVideoService.stitch(framePath, 15, outputPath);

    unlinkSync(framePath);

    return outputPath;
  }
}
