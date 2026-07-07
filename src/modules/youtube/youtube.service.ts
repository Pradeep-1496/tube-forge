import {
  Injectable,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { google } from 'googleapis';
import { Op } from 'sequelize';
import * as fs from 'fs';
import { Channel } from 'src/common/models/channel.model';
import { Metadata } from 'src/common/models/metadata.model';
import { MetadataStatus } from 'src/common/enums/metadata-status.enum';

@Injectable()
export class YoutubeService {
  private readonly oauth2Client: any;

  constructor(
    @InjectModel(Channel) private readonly channelModel: typeof Channel,
    @InjectModel(Metadata) private readonly metadataModel: typeof Metadata,
  ) {
    this.oauth2Client = new (google.auth.OAuth2 as any)(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI,
    );
  }

  private async getYoutube(channel: Channel) {
    this.oauth2Client.setCredentials({
      access_token: channel.accessToken,
      refresh_token: channel.refreshToken,
      expiry_date: channel.expiryDate,
    });
    return google.youtube({ version: 'v3', auth: this.oauth2Client });
  }

  generateAuthUrl(userId: string): string {
    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: [
        'https://www.googleapis.com/auth/youtube.upload',
        'https://www.googleapis.com/auth/youtube.readonly',
      ],
      state: userId,
    });
  }

  async handleYoutubeCallback(state: string, code: string) {
    const { tokens } = await this.oauth2Client.getToken(code);
    return this.saveYoutubeChannel(state, tokens);
  }

  async saveYoutubeChannel(
    userId: string,
    tokens: {
      access_token: string;
      refresh_token?: string;
      expiry_date?: number;
    },
  ) {
    this.oauth2Client.setCredentials({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expiry_date: tokens.expiry_date,
    });

    const youtube = google.youtube({ version: 'v3', auth: this.oauth2Client });
    const { data: channelsRes } = await youtube.channels.list({
      mine: true,
      part: ['snippet', 'id'],
    });

    const youtubeChannel = channelsRes.items?.[0];
    if (!youtubeChannel) {
      throw new Error(
        'No YouTube channel found for this Google account. Make sure the account has a YouTube channel.',
      );
    }

    const channelId = youtubeChannel.id ?? '';
    const channelName = youtubeChannel.snippet?.title ?? 'My YouTube Channel';

    const clientId = process.env.GOOGLE_CLIENT_ID ?? '';
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET ?? '';

    const channel = await this.channelModel.findOne({ where: { userId } });

    const payload = {
      channelId,
      name: channelName,
      clientId,
      clientSecret,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token ?? null,
      expiryDate: tokens.expiry_date ?? null,
      userId,
    };

    if (channel) {
      await channel.update(payload);
    } else {
      await this.channelModel.create(payload);
    }

    return this.channelModel.findOne({ where: { userId } }) as Promise<Channel>;
  }

  async getUserChannels(userId: string) {
    const channels = await this.channelModel.findAll({
      where: { userId },
      order: [['created_at', 'DESC']],
    });
    return channels.map((ch) => ({
      id: ch.id,
      name: ch.name,
      channelId: ch.channelId,
      createdAt: ch.createdAt,
      updatedAt: ch.updatedAt,
    }));
  }

  async getChannelInfo(userId: string) {
    const channel = await this.channelModel.findOne({ where: { userId } });
    if (!channel) {
      throw new BadRequestException('No YouTube channel connected');
    }

    this.oauth2Client.setCredentials({
      access_token: channel.accessToken,
      refresh_token: channel.refreshToken,
      expiry_date: channel.expiryDate,
    });

    const oauth2 = google.oauth2({ version: 'v2', auth: this.oauth2Client });
    const { data } = await oauth2.userinfo.get();
    return {
      channelId: data.id,
      channelTitle: data.name,
      description: '',
      thumbnails: data.picture ? { default: { url: data.picture } } : undefined,
    };
  }

  async uploadVideo(userId: string, metadataId: string) {
    const meta = await this.metadataModel.findOne({
      where: {
        id: metadataId,
        userId,
        [Op.or]: [
          { status: MetadataStatus.DRAFT },
          { status: MetadataStatus.GENERATED },
          { status: MetadataStatus.SCHEDULED },
        ],
      },
    });

    if (!meta) {
      throw new NotFoundException('Metadata not found or already uploaded');
    }

    const channel = await this.channelModel.findOne({
      where: { userId },
    });

    if (!channel) {
      throw new BadRequestException(
        'No YouTube channel connected. Please connect a YouTube channel first.',
      );
    }

    const videoPath = meta.output_video_path;
    if (!videoPath) {
      throw new BadRequestException(
        'No output video path found in metadata. Generate the video first.',
      );
    }

    if (!fs.existsSync(videoPath)) {
      throw new BadRequestException('Video file not found on server.');
    }

    const videoBuffer = fs.readFileSync(videoPath);
    const b64Video = videoBuffer.toString('base64');

    const youtube = await this.getYoutube(channel);

    const privacy = ['public', 'private', 'unlisted'].includes(
      meta.privacy_status,
    )
      ? meta.privacy_status
      : 'private';

    const requestBody: any = {
      snippet: {
        title: meta.title,
        description: meta.description ?? '',
        tags: meta.tags ?? [],
        categoryId: meta.category_id ?? '22',
        defaultLanguage: meta.default_language ?? 'en',
      },
      status: {
        privacyStatus: privacy,
        selfDeclaredMadeForKids: meta.self_declared_made_for_kids,
      },
    };

    if (meta.publish_at) {
      requestBody.status.publishAt = meta.publish_at.toISOString();
    }

    let response = await youtube.videos.insert({
      requestBody,
      part: ['snippet', 'status'],
      media: {
        body: Buffer.from(b64Video, 'base64'),
        mimeType: 'video/mp4',
      },
    });

    if (response.status === 401) {
      try {
        await this.oauth2Client.refreshAccessToken();
      } catch {
        throw new BadRequestException(
          'YouTube token expired and refresh failed. Please reconnect your channel.',
        );
      }

      const freshTokens = this.oauth2Client.credentials;
      await channel.update({
        accessToken: freshTokens.access_token ?? channel.accessToken,
        refreshToken: freshTokens.refresh_token ?? channel.refreshToken,
        expiryDate: freshTokens.expiry_date ?? channel.expiryDate,
      });

      const freshYoutube = await this.getYoutube(channel);
      response = await freshYoutube.videos.insert({
        requestBody,
        part: ['snippet', 'status'],
        media: {
          body: Buffer.from(b64Video, 'base64'),
          mimeType: 'video/mp4',
        },
      });
    }

    if (!response.data?.id) {
      throw new InternalServerErrorException(
        'YouTube upload failed: no video ID returned.',
      );
    }

    const videoId = response.data.id;
    const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;

    await meta.update({
      status: MetadataStatus.UPLOADED,
      youtubeVideoId: videoId,
      youtubeUrl,
      channelId: channel.id,
      thumbnailPath: response.data.snippet?.thumbnails?.default?.url ?? null,
    });

    return {
      message: 'Uploaded successfully',
      videoId,
      youtubeUrl,
      metadataId: meta.id,
    };
  }
}
