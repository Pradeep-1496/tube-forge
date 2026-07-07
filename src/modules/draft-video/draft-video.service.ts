import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { Op } from 'sequelize';
import { VideoContent } from 'src/common/models/video-content.model';
import { User } from 'src/common/models/user.model';
import { Background } from 'src/common/models/background.model';
import { BackgroundVideo } from 'src/common/models/background-video.model';
import { Audio } from 'src/common/models/audio.model';
import { SubscribeImage } from 'src/common/models/subscribe-image.model';
import { Channel } from 'src/common/models/channel.model';
import { DraftVideo } from 'src/common/models/draft-video.model';
import { Metadata } from 'src/common/models/metadata.model';
import { DraftVideoStatus } from 'src/common/enums/draft-video-status.enum';
import { Visibility } from 'src/common/enums/visibility.enum';
import { VideoGenerationService } from 'src/modules/video-generation/video-generation.service';

import { UpdateDraftVideoDto } from './dto/update-draft-video.dto';
import type { UserType } from 'src/common/types/user.type';

@Injectable()
export class DraftVideoService {
  constructor(
    private readonly videoGenerationService: VideoGenerationService,
  ) {}
  private isAdmin(user: UserType): boolean {
    return user.role === 'admin';
  }

  async findAll(user: UserType): Promise<DraftVideo[]> {
    if (this.isAdmin(user)) {
      return DraftVideo.findAll({
        order: [['created_at', 'DESC']],
        include: [
          {
            model: VideoContent,
            as: 'content',
            required: false,
            include: [{ model: User, as: 'user', attributes: ['name'] }],
          },
          { model: Background, as: 'background', required: false },
          { model: Audio, as: 'audio', required: false },
          { model: SubscribeImage, as: 'subscribeImage', required: false },
        ],
      });
    }
    return DraftVideo.findAll({
      where: {
        [Op.or]: [{ userId: user.id }, { visibility: Visibility.PUBLIC }],
      },
      order: [['created_at', 'DESC']],
      include: [
        {
          model: VideoContent,
          as: 'content',
          required: false,
          include: [{ model: User, as: 'user', attributes: ['name'] }],
        },
        { model: Background, as: 'background', required: false },
        { model: Audio, as: 'audio', required: false },
        { model: SubscribeImage, as: 'subscribeImage', required: false },
      ],
    });
  }

  async findOne(id: string, user: UserType): Promise<DraftVideo> {
    const record = await DraftVideo.findByPk(id, {
      include: [
        {
          model: VideoContent,
          as: 'content',
          required: false,
          include: [{ model: User, as: 'user', attributes: ['name'] }],
        },
        { model: Background, as: 'background', required: false },
        { model: Audio, as: 'audio', required: false },
        { model: SubscribeImage, as: 'subscribeImage', required: false },
      ],
    });
    if (!record) {
      throw new NotFoundException(`Draft video with ID ${id} not found`);
    }
    if (!this.isAdmin(user) && record.userId !== user.id) {
      throw new ForbiddenException(
        'You do not have access to this draft video',
      );
    }
    return record;
  }

  async update(
    id: string,
    dto: UpdateDraftVideoDto,
    user: UserType,
  ): Promise<DraftVideo> {
    const draft = await DraftVideo.findByPk(id);
    if (!draft) {
      throw new NotFoundException(`Draft video with ID ${id} not found`);
    }
    if (!this.isAdmin(user) && draft.dataValues.userId !== user.id) {
      throw new ForbiddenException(
        'You do not have permission to update this draft video',
      );
    }

    if (dto.channelId) {
      const channel = await Channel.findOne({
        where: { channelId: dto.channelId, userId: user.id },
        raw: true,
      });
      if (!channel) {
        throw new NotFoundException(`Channel not found for ${dto.channelId}`);
      }
    }

    if (dto.backgroundId) {
      const background = await Background.findByPk(dto.backgroundId);
      if (!background) {
        throw new NotFoundException(
          `Background with ID ${dto.backgroundId} not found`,
        );
      }
      if (
        !this.isAdmin(user) &&
        background.userId !== user.id &&
        background.visibility !== Visibility.PUBLIC
      ) {
        throw new ForbiddenException(
          'You do not have access to this background',
        );
      }
    }

    if (dto.audioId) {
      const audio = await Audio.findByPk(dto.audioId, { raw: true });
      if (!audio) {
        throw new NotFoundException(`Audio with ID ${dto.audioId} not found`);
      }
      if (
        !this.isAdmin(user) &&
        audio.userId !== user.id &&
        audio.visibility !== Visibility.PUBLIC
      ) {
        throw new ForbiddenException('You do not have access to this audio');
      }
    }

    if (dto.subscribeImageId) {
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
    }

    const updateData: Record<string, unknown> = {};
    if (dto.theme !== undefined) updateData.theme = dto.theme;
    if (dto.backgroundId !== undefined)
      updateData.backgroundId = dto.backgroundId;
    if (dto.audioId !== undefined) updateData.audioId = dto.audioId;
    if (dto.subscribeImageId !== undefined)
      updateData.subscribeImageId = dto.subscribeImageId;
    if (dto.channelId !== undefined) updateData.channelId = dto.channelId;
    if (dto.publishedDate !== undefined)
      updateData.publishedAt = new Date(dto.publishedDate);

    await draft.update(updateData);
    return draft.reload();
  }

  async remove(id: string, user: UserType): Promise<void> {
    const draft = await DraftVideo.findByPk(id);
    if (!draft) {
      throw new NotFoundException(`Draft video with ID ${id} not found`);
    }
    if (!this.isAdmin(user) && draft.userId !== user.id) {
      throw new ForbiddenException(
        'You do not have permission to delete this draft video',
      );
    }
    await draft.destroy();
  }

  async generateVideoFromDraft(
    user: UserType,
    draftId: string,
  ): Promise<{ outputPath: string; metadata: Metadata }> {
    const draft = await DraftVideo.findByPk(draftId);
    if (!draft) {
      throw new NotFoundException(`Draft video with ID ${draftId} not found`);
    }
    if (!this.isAdmin(user) && draft.userId !== user.id) {
      throw new ForbiddenException(
        'You do not have access to this draft video',
      );
    }

    await draft.update({ status: DraftVideoStatus.GENERATING });

    try {
      if (!draft.publishedAt) {
        throw new BadRequestException(
          'Draft video does not have a published date set',
        );
      }

      const publishedDate = draft.publishedAt.toISOString();
      let result: { outputPath: string; metadata: Metadata };
      if (draft.backgroundVideoId) {
        result =
          await this.videoGenerationService.generateVideoFromBackgroundVideo(
            user,
            draft.contentId,
            draft.backgroundVideoId,
            draft.audioId || undefined,
            draft.theme,
            draft.subscribeImageId || undefined,
            draft.channelId,
            publishedDate,
          );
      } else {
        result = await this.videoGenerationService.generateVideo(
          user,
          draft.contentId,
          {
            backgroundId: draft.backgroundId || undefined,
            theme: draft.theme,
            audioId: draft.audioId || undefined,
            subscribeImageId: draft.subscribeImageId || undefined,
            channelId: draft.channelId,
            publishedDate,
          },
        );
      }

      await draft.update({
        status: DraftVideoStatus.GENERATED,
        outputVideoPath: result.outputPath,
        thumbnailPath: result.metadata.thumbnailPath,
        file_name: result.metadata.file_name,
      });

      return result;
    } catch (error) {
      await draft.update({ status: DraftVideoStatus.FAILED });
      throw error;
    }
  }

  async createDraftFromContent(
    user: UserType,
    videoContentId: string,
    dto: {
      backgroundId?: string;
      theme?: string;
      audioId?: string;
      subscribeImageId?: string;
      channelId: string;
      publishedDate?: string;
    },
  ): Promise<DraftVideo> {
    const contentRecord = await VideoContent.findByPk(videoContentId, {
      raw: true,
    });
    if (!contentRecord) {
      throw new NotFoundException(
        `VideoContent with ID ${videoContentId} not found`,
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

    const channel = await Channel.findOne({
      where: { channelId: dto.channelId, userId: user.id },
      raw: true,
    });
    if (!channel) {
      throw new NotFoundException(`Channel not found for ${dto.channelId}`);
    }

    let backgroundId: string | null = null;
    if (dto.backgroundId) {
      const background = await Background.findByPk(dto.backgroundId);
      if (!background) {
        throw new NotFoundException(
          `Background with ID ${dto.backgroundId} not found`,
        );
      }
      if (
        !this.isAdmin(user) &&
        background.userId !== user.id &&
        background.visibility !== Visibility.PUBLIC
      ) {
        throw new ForbiddenException(
          'You do not have access to this background',
        );
      }
      backgroundId = background.id;
    }

    let resolvedAudioId: string | null = null;
    if (dto.audioId) {
      const audio = await Audio.findByPk(dto.audioId, { raw: true });
      if (audio) {
        if (
          !this.isAdmin(user) &&
          audio.userId !== user.id &&
          audio.visibility !== Visibility.PUBLIC
        ) {
          throw new ForbiddenException('You do not have access to this audio');
        }
        resolvedAudioId = audio.audio_id;
      }
    }

    let resolvedSubscribeImageId: string | null = null;
    if (dto.subscribeImageId) {
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
      resolvedSubscribeImageId = subscribeImage.id;
    }

    const draft = await DraftVideo.create({
      contentId: contentRecord.id,
      theme: dto.theme,
      backgroundId,
      audioId: resolvedAudioId,
      subscribeImageId: resolvedSubscribeImageId,
      channelId: dto.channelId,
      publishedAt: dto.publishedDate ? new Date(dto.publishedDate) : null,
      userId: user.id,
      status: DraftVideoStatus.PENDING,
      visibility: Visibility.PRIVATE,
    });

    return draft;
  }

  async createDraftFromBackgroundVideo(
    user: UserType,
    videoContentId: string,
    backgroundVideoId: string,
    dto: {
      audioId?: string;
      theme?: string;
      subscribeImageId?: string;
      channelId: string;
      publishedDate?: string;
    },
  ): Promise<DraftVideo> {
    const contentRecord = await VideoContent.findByPk(videoContentId, {
      raw: true,
    });
    if (!contentRecord) {
      throw new NotFoundException(
        `VideoContent with ID ${videoContentId} not found`,
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

    const channel = await Channel.findOne({
      where: { channelId: dto.channelId, userId: user.id },
      raw: true,
    });
    if (!channel) {
      throw new NotFoundException(`Channel not found for ${dto.channelId}`);
    }

    let resolvedAudioId: string | null = null;
    if (dto.audioId) {
      const audio = await Audio.findByPk(dto.audioId, { raw: true });
      if (audio) {
        if (
          !this.isAdmin(user) &&
          audio.userId !== user.id &&
          audio.visibility !== Visibility.PUBLIC
        ) {
          throw new ForbiddenException('You do not have access to this audio');
        }
        resolvedAudioId = audio.audio_id;
      }
    }

    let resolvedSubscribeImageId: string | null = null;
    if (dto.subscribeImageId) {
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
      resolvedSubscribeImageId = subscribeImage.id;
    }

    const draft = await DraftVideo.create({
      contentId: contentRecord.id,
      theme: dto.theme,
      backgroundVideoId: backgroundVideo.bg_video_id,
      audioId: resolvedAudioId,
      subscribeImageId: resolvedSubscribeImageId,
      channelId: dto.channelId,
      publishedAt: dto.publishedDate ? new Date(dto.publishedDate) : null,
      userId: user.id,
      status: DraftVideoStatus.PENDING,
      visibility: Visibility.PRIVATE,
    });

    return draft;
  }
}
