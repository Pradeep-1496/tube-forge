import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { VideoContent } from '../../common/models/video-content.model';
import { Background } from 'src/common/models/background.model';
import { BackgroundVideo } from 'src/common/models/background-video.model';
import { Audio } from 'src/common/models/audio.model';
import { SubscribeImage } from 'src/common/models/subscribe-image.model';
import { Metadata } from 'src/common/models/metadata.model';
import { Channel } from 'src/common/models/channel.model';
import { CerebrasService } from 'src/common/services/cerebras.service';
import { join } from 'path';
import { existsSync, mkdirSync, unlinkSync, readFileSync } from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';
const execAsync = promisify(exec);
import { HtmlToImageService } from './services/html-to-image.service';
import { ImageToVideoService } from './services/image-to-video.service';
import { AudioService } from './services/audio.service';
import {
  BackgroundImageProvider,
  BackgroundImageConfig,
} from './services/background-image.provider';
import { GenerateVideoDto } from './dto/generate-video.dto';
import { Visibility } from 'src/common/enums/visibility.enum';
import { Op } from 'sequelize';

interface UserPlain {
  id: string;
  name: string;
  email: string;
  role: string;
}

@Injectable()
export class VideoGenerationService {
  constructor(
    private readonly htmlToImageService: HtmlToImageService,
    private readonly imageToVideoService: ImageToVideoService,
    private readonly audioService: AudioService,
    private readonly backgroundProvider: BackgroundImageProvider,
    private readonly cerebrasService: CerebrasService,
  ) {}

  private isAdmin(user: UserPlain): boolean {
    return user.role === 'admin';
  }

  async generateVideo(
    user: UserPlain,
    id: string,
    dto?: GenerateVideoDto,
  ): Promise<{ outputPath: string; metadata: Metadata }> {
    await this.ensureUserHasChannel(user.id);

    const contentRecord = await VideoContent.findByPk(id, {
      raw: true,
    });
    if (!contentRecord) {
      throw new NotFoundException(`VideoContent with ID ${id} not found`);
    }
    if (
      !this.isAdmin(user) &&
      contentRecord.userId !== user.id &&
      contentRecord.visibility !== Visibility.PUBLIC
    ) {
      throw new ForbiddenException(
        'You do not have access to this video content',
      );
    }

    const { title, content } = contentRecord;

    if (!dto?.channelId) {
      throw new BadRequestException('channelId is required');
    }

    if (!dto?.publishedDate) {
      throw new BadRequestException('publishedDate is required');
    }

    const channel = await Channel.findOne({
      where: { channelId: dto.channelId, userId: user.id },
      raw: true,
    });
    if (!channel) {
      throw new NotFoundException(`Channel not found for ${dto.channelId}`);
    }

    const outputDir = join(process.cwd(), 'output-videos');
    const thumbnailDir = join(process.cwd(), 'thumbnail');
    if (!existsSync(outputDir)) {
      mkdirSync(outputDir, { recursive: true });
    }
    if (!existsSync(thumbnailDir)) {
      mkdirSync(thumbnailDir, { recursive: true });
    }

    const framePath = join(outputDir, `frame-${Date.now()}.png`);

    const bgConfig = await this.buildBackgroundConfig(dto?.backgroundId, user);
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
    const outputPath = join(outputDir, filename);

    let preparedAudioPath: string | null = null;
    try {
      const audioFilePath = await this.resolveAudioFilePath(dto?.audioId, user);
      preparedAudioPath = await this.audioService.prepareAudio(audioFilePath);

      if (dto?.subscribeImageId) {
        const subscribeImage = await SubscribeImage.findByPk(
          dto.subscribeImageId,
          { raw: true },
        );
        if (!subscribeImage) {
          throw new NotFoundException(
            `Subscribe image with ID ${dto.subscribeImageId} not found`,
          );
        }
        if (
          !this.isAdmin(user) &&
          subscribeImage.userId !== user.id &&
          subscribeImage.visibility !== Visibility.PUBLIC
        ) {
          throw new ForbiddenException(
            'You do not have access to this subscribe image',
          );
        }

        const subscribeImgPath = join(process.cwd(), subscribeImage.path);
        if (!existsSync(subscribeImgPath)) {
          throw new NotFoundException(
            `Subscribe image file not found at ${subscribeImage.path}`,
          );
        }

        const mainSegmentPath = join(outputDir, `segment-main-${timePart}.mp4`);
        const subscribeSegmentPath = join(
          outputDir,
          `segment-subscribe-${timePart}.mp4`,
        );
        const concatPath = join(outputDir, `concat-${timePart}.mp4`);

        await this.imageToVideoService.stitch(framePath, 10, mainSegmentPath);
        await this.imageToVideoService.stitch(
          subscribeImgPath,
          5,
          subscribeSegmentPath,
        );
        await this.imageToVideoService.concatenate(
          [mainSegmentPath, subscribeSegmentPath],
          concatPath,
        );
        await this.imageToVideoService.mergeAudio(
          concatPath,
          preparedAudioPath ?? undefined,
          outputPath,
        );

        this.safeUnlink(mainSegmentPath);
        this.safeUnlink(subscribeSegmentPath);
        this.safeUnlink(concatPath);
      } else {
        await this.imageToVideoService.stitch(
          framePath,
          15,
          outputPath,
          preparedAudioPath ?? undefined,
        );
      }
    } finally {
      this.audioService.cleanupTemp(preparedAudioPath);
    }

    unlinkSync(framePath);

    const thumbnailFilename = `${datePart}-${timePart}.png`;
    const thumbnailPath = join(thumbnailDir, thumbnailFilename);
    await this.generateThumbnailFromVideo(outputPath, thumbnailPath);

    const storedMetadata = await this.generateAndStoreMetadata(
      title,
      content,
      filename,
      outputPath,
      channel.id,
      dto.publishedDate,
      contentRecord.id,
      thumbnailPath,
      user,
    );

    return { outputPath, metadata: storedMetadata };
  }

  async generateVideoFromBackgroundVideo(
    user: UserPlain,
    metadataId: string,
    backgroundVideoId: string,
    audioId?: string,
    theme?: string,
    subscribeImageId?: string,
    channelId?: string,
    publishedDate?: string,
  ): Promise<{ outputPath: string; metadata: Metadata }> {
    await this.ensureUserHasChannel(user.id);

    const contentRecord = await VideoContent.findByPk(metadataId, {
      raw: true,
    });
    if (!contentRecord) {
      throw new NotFoundException(
        `VideoContent with ID ${metadataId} not found`,
      );
    }

    if (
      !this.isAdmin(user) &&
      contentRecord.userId !== user.id &&
      contentRecord.visibility !== Visibility.PUBLIC
    ) {
      throw new ForbiddenException(
        'You do not have access to this video content',
      );
    }

    const { title, content } = contentRecord;

    if (!channelId) {
      throw new BadRequestException('channelId is required');
    }

    if (!publishedDate) {
      throw new BadRequestException('publishedDate is required');
    }

    const channel = await Channel.findOne({
      where: { channelId, userId: user.id },
      raw: true,
    });
    if (!channel) {
      throw new NotFoundException(`Channel not found for ${channelId}`);
    }

    const backgroundVideo = await BackgroundVideo.findByPk(backgroundVideoId, {
      raw: true,
    });
    if (!backgroundVideo) {
      throw new NotFoundException(
        `Background video with ID ${backgroundVideoId} not found`,
      );
    }
    if (
      !this.isAdmin(user) &&
      backgroundVideo.userId !== user.id &&
      backgroundVideo.visibility !== Visibility.PUBLIC
    ) {
      throw new ForbiddenException(
        'You do not have access to this background video',
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
    const outputPath = join(outputDir, filename);

    let preparedAudioPath: string | null = null;
    try {
      const audioFilePath = await this.resolveAudioFilePath(audioId, user);
      preparedAudioPath = await this.audioService.prepareAudio(audioFilePath);

      if (subscribeImageId) {
        const subscribeImage = await SubscribeImage.findByPk(subscribeImageId, {
          raw: true,
        });
        if (!subscribeImage) {
          throw new NotFoundException(
            `Subscribe image with ID ${subscribeImageId} not found`,
          );
        }
        if (
          !this.isAdmin(user) &&
          subscribeImage.userId !== user.id &&
          subscribeImage.visibility !== Visibility.PUBLIC
        ) {
          throw new ForbiddenException(
            'You do not have access to this subscribe image',
          );
        }

        const subscribeImgPath = join(process.cwd(), subscribeImage.path);
        if (!existsSync(subscribeImgPath)) {
          throw new NotFoundException(
            `Subscribe image file not found at ${subscribeImage.path}`,
          );
        }

        const mainSegmentPath = join(outputDir, `segment-main-${timePart}.mp4`);
        const subscribeSegmentPath = join(
          outputDir,
          `segment-subscribe-${timePart}.mp4`,
        );
        const concatPath = join(outputDir, `concat-${timePart}.mp4`);

        await this.imageToVideoService.stitchWithOverlay(
          backgroundVideoPath,
          overlayPath,
          10,
          mainSegmentPath,
        );
        await this.imageToVideoService.stitch(
          subscribeImgPath,
          5,
          subscribeSegmentPath,
        );
        await this.imageToVideoService.concatenate(
          [mainSegmentPath, subscribeSegmentPath],
          concatPath,
        );
        await this.imageToVideoService.mergeAudio(
          concatPath,
          preparedAudioPath ?? undefined,
          outputPath,
        );

        this.safeUnlink(mainSegmentPath);
        this.safeUnlink(subscribeSegmentPath);
        this.safeUnlink(concatPath);
      } else {
        await this.imageToVideoService.stitchWithOverlay(
          backgroundVideoPath,
          overlayPath,
          15,
          outputPath,
          preparedAudioPath ?? undefined,
        );
      }
    } finally {
      this.audioService.cleanupTemp(preparedAudioPath);
      if (existsSync(overlayPath)) {
        unlinkSync(overlayPath);
      }
    }

    const thumbnailFilename = `${datePart}-${timePart}.png`;
    const thumbnailPath = join(thumbnailDir, thumbnailFilename);
    await this.generateThumbnailFromVideo(outputPath, thumbnailPath);

    const storedMetadata = await this.generateAndStoreMetadata(
      title,
      content,
      filename,
      outputPath,
      channel.id,
      publishedDate,
      contentRecord.id,
      thumbnailPath,
      user,
    );

    return { outputPath, metadata: storedMetadata };
  }

  private async ensureUserHasChannel(userId: string): Promise<void> {
    const channels = await Channel.findAll({ where: { userId } });
    if (!channels || channels.length === 0) {
      throw new BadRequestException(
        'You must create a YouTube channel before generating videos',
      );
    }
  }

  private async generateAndStoreMetadata(
    title: string,
    content: string,
    filename: string,
    outputPath: string,
    channelDbId: string,
    publishedDate: string,
    contentId: string,
    thumbnailPath: string,
    user: UserPlain,
  ): Promise<Metadata> {
    try {
      const aiMetadata = await this.cerebrasService.generateMetadata(
        title,
        content,
      );
      return await Metadata.create({
        title: aiMetadata.title,
        description: aiMetadata.description,
        tags: aiMetadata.tags,
        file_name: filename,
        output_video_path: outputPath,
        privacy_status: 'private',
        default_language: 'en',
        self_declared_made_for_kids: true,
        channelId: channelDbId,
        publish_at: new Date(publishedDate),
        category_id: aiMetadata.category_id,
        contentId,
        thumbnailPath,
        userId: user.id,
        visibility: Visibility.PRIVATE,
      });
    } catch (error) {
      console.error(
        'Auto-metadata generation failed:',
        error instanceof Error ? error.message : error,
      );
      return await Metadata.create({
        title,
        description: '',
        tags: [],
        file_name: filename,
        output_video_path: outputPath,
        privacy_status: 'private',
        default_language: 'en',
        self_declared_made_for_kids: true,
        channelId: channelDbId,
        publish_at: new Date(publishedDate),
        contentId,
        thumbnailPath,
        userId: user.id,
        visibility: Visibility.PRIVATE,
      });
    }
  }

  private async resolveAudioFilePath(
    audioId: string | undefined,
    user: UserPlain,
  ): Promise<string | null> {
    if (!audioId) {
      return null;
    }

    const audio = await Audio.findByPk(audioId);
    if (!audio) {
      return null;
    }
    if (
      !this.isAdmin(user) &&
      audio.userId !== user.id &&
      audio.visibility !== Visibility.PUBLIC
    ) {
      return null;
    }

    return join(process.cwd(), audio.path);
  }

  private async buildBackgroundConfig(
    backgroundId?: string,
    user?: UserPlain,
  ): Promise<BackgroundImageConfig> {
    if (!backgroundId) {
      return { enabled: false, opacity: 0.45 };
    }

    const background = await Background.findByPk(backgroundId);
    if (!background) {
      throw new NotFoundException(
        `Background with ID ${backgroundId} not found`,
      );
    }
    if (
      user &&
      !this.isAdmin(user) &&
      background.userId !== user.id &&
      background.visibility !== Visibility.PUBLIC
    ) {
      throw new ForbiddenException('You do not have access to this background');
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

  private safeUnlink(filePath: string): void {
    try {
      if (existsSync(filePath)) {
        unlinkSync(filePath);
      }
    } catch {
      /* ignore */
    }
  }

  private async generateThumbnailFromVideo(
    videoPath: string,
    thumbnailPath: string,
  ): Promise<void> {
    await execAsync(
      `ffmpeg -ss 00:00:01 -i "${videoPath}" -vframes 1 -q:v 2 "${thumbnailPath}" -y`,
    );
  }

  getAvailableThemes(): string[] {
    return [
      'glassmorphism',
      'neon',
      'viral',
      'apple',
      'gold',
      'none',
      'custom',
      'news',
    ];
  }
}
