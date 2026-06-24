import { Injectable, NotFoundException } from '@nestjs/common';
import { Metadata } from '../../common/models/metadata.model';
import { Background } from '../../common/models/background.model';
import { join } from 'path';
import {
  existsSync,
  mkdirSync,
  copyFileSync,
  unlinkSync,
  readFileSync,
} from 'fs';
import { HtmlToImageService } from './services/html-to-image.service';
import { ImageToVideoService } from './services/image-to-video.service';
import { AudioService } from './services/audio.service';
import {
  BackgroundImageProvider,
  BackgroundImageConfig,
} from './services/background-image.provider';
import { GenerateVideoDto } from './dto/generate-video.dto';

@Injectable()
export class VideoGenerationService {
  constructor(
    private readonly htmlToImageService: HtmlToImageService,
    private readonly imageToVideoService: ImageToVideoService,
    private readonly audioService: AudioService,
    private readonly backgroundProvider: BackgroundImageProvider,
  ) {}

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

  async generateVideo(id: string, dto?: GenerateVideoDto): Promise<string> {
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

    const bgConfig = await this.buildBackgroundConfig(dto?.backgroundId);
    const html = this.htmlToImageService.buildVideoHtml(
      title,
      content,
      true,
      bgConfig,
      dto?.theme,
    );
    await this.htmlToImageService.render(html, framePath, bgConfig);

    const now = new Date();
    const datePart = now.toISOString().slice(0, 10);
    const timePart = Date.now();
    const filename = `${datePart}-${timePart}.mp4`;
    const thumbnailFilename = `${datePart}-${timePart}.png`;
    const outputPath = join(outputDir, filename);
    const thumbnailPath = join(thumbnailDir, thumbnailFilename);

    copyFileSync(framePath, thumbnailPath);

    let preparedAudioPath: string | null = null;
    try {
      preparedAudioPath = await this.audioService.prepareAudio(dto?.audioPath);
      await this.imageToVideoService.stitch(
        framePath,
        15,
        outputPath,
        preparedAudioPath ?? undefined,
      );
    } finally {
      this.audioService.cleanupTemp(preparedAudioPath);
    }

    unlinkSync(framePath);

    return outputPath;
  }

  private async buildBackgroundConfig(
    backgroundId?: string,
  ): Promise<BackgroundImageConfig> {
    if (!backgroundId) {
      return { enabled: false, opacity: 0.45 };
    }

    const background = await Background.findByPk(backgroundId, { raw: true });
    if (!background) {
      throw new NotFoundException(
        `Background with ID ${backgroundId} not found`,
      );
    }

    const fullPath = join(process.cwd(), background.path);
    if (!existsSync(fullPath)) {
      return { enabled: false, opacity: 0.45 };
    }

    try {
      const buf = readFileSync(fullPath);
      const b64 = buf.toString('base64');
      const ext = background.path.split('.').pop()?.toLowerCase() || 'jpg';
      const mimeType = ext === 'png' ? 'image/png' : 'image/jpeg';
      return {
        enabled: true,
        path: background.path,
        dataUrl: `data:${mimeType};base64,${b64}`,
        opacity: 0.45,
      };
    } catch {
      return { enabled: false, opacity: 0.45 };
    }
  }

  getAvailableThemes(): string[] {
    return ['glassmorphism', 'neon', 'viral', 'apple', 'gold'];
  }
}
