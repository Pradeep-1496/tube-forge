import { Injectable, NotFoundException } from '@nestjs/common';
import { VideoContent } from '../../common/models/video-content.model';
import { Background } from '../../common/models/background.model';
import { BackgroundVideo } from '../../common/models/background-video.model';
import { Audio } from '../../common/models/audio.model';
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

  async findAll(): Promise<VideoContent[]> {
    return VideoContent.findAll();
  }

  async findOne(id: string): Promise<VideoContent> {
    const metadata = await VideoContent.findByPk(id, { raw: true });
    if (!metadata) {
      throw new NotFoundException(`VideoContent with ID ${id} not found`);
    }
    return metadata;
  }

  async generateVideo(id: string, dto?: GenerateVideoDto): Promise<string> {
    const metadata = await VideoContent.findByPk(id, { raw: true });
    if (!metadata) {
      throw new NotFoundException(`VideoContent with ID ${id} not found`);
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
    await this.htmlToImageService.render(html, framePath);

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
      const audioFilePath = await this.resolveAudioFilePath(dto?.audioId);
      preparedAudioPath = await this.audioService.prepareAudio(audioFilePath);
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

  async generateVideoFromBackgroundVideo(
    metadataId: string,
    backgroundVideoId: string,
    audioId?: string,
    theme?: string,
  ): Promise<string> {
    const metadata = await VideoContent.findByPk(metadataId, { raw: true });
    if (!metadata) {
      throw new NotFoundException(
        `VideoContent with ID ${metadataId} not found`,
      );
    }

    const { title, content } = metadata;

    const backgroundVideo = await BackgroundVideo.findByPk(backgroundVideoId, {
      raw: true,
    });
    if (!backgroundVideo) {
      throw new NotFoundException(
        `Background video with ID ${backgroundVideoId} not found`,
      );
    }

    const backgroundVideoPath = join(process.cwd(), backgroundVideo.path);
    if (!existsSync(backgroundVideoPath)) {
      throw new NotFoundException(
        `Background video file not found at ${backgroundVideo.path}`,
      );
    }

    const outputDir = join(process.cwd(), 'output-videos');
    const thumbnailDir = join(process.cwd(), 'thumbnail');
    if (!existsSync(outputDir)) {
      mkdirSync(outputDir, { recursive: true });
    }
    if (!existsSync(thumbnailDir)) {
      mkdirSync(thumbnailDir, { recursive: true });
    }

    const overlayPath = join(outputDir, `overlay-${Date.now()}.png`);

    const html = this.htmlToImageService.buildVideoHtml(
      title,
      content,
      true,
      undefined,
      theme,
    );
    await this.htmlToImageService.renderTransparent(html, overlayPath);

    const now = new Date();
    const datePart = now.toISOString().slice(0, 10);
    const timePart = Date.now();
    const filename = `${datePart}-${timePart}.mp4`;
    const thumbnailFilename = `${datePart}-${timePart}.png`;
    const outputPath = join(outputDir, filename);
    const thumbnailPath = join(thumbnailDir, thumbnailFilename);

    copyFileSync(overlayPath, thumbnailPath);

    let preparedAudioPath: string | null = null;
    try {
      const audioFilePath = await this.resolveAudioFilePath(audioId);
      preparedAudioPath = await this.audioService.prepareAudio(audioFilePath);
      await this.imageToVideoService.stitchWithOverlay(
        backgroundVideoPath,
        overlayPath,
        15,
        outputPath,
        preparedAudioPath ?? undefined,
      );
    } finally {
      this.audioService.cleanupTemp(preparedAudioPath);
      if (existsSync(overlayPath)) {
        unlinkSync(overlayPath);
      }
    }

    return outputPath;
  }

  private async resolveAudioFilePath(
    audioId: string | undefined,
  ): Promise<string | null> {
    if (!audioId) {
      return null;
    }

    const audio = await Audio.findByPk(audioId, { raw: true });
    if (!audio) {
      return null;
    }

    return join(process.cwd(), audio.path);
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
