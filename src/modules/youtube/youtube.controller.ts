import {
  Controller,
  Get,
  Post,
  Query,
  Res,
  Body,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { UploadYoutubeDto } from './dto/upload-youtube.dto';
import { YoutubeService } from './youtube.service';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import type { UserType } from 'src/common/types/user.type';

@ApiTags('youtube')
@Controller('youtube')
export class YoutubeController {
  constructor(private readonly youtubeService: YoutubeService) {}

  @Get('login')
  @UseGuards(RolesGuard)
  @Roles('user', 'admin')
  @ApiBearerAuth()
  login(@Res() res: Response, @CurrentUser() user: UserType) {
    if (!user?.id) {
      throw new BadRequestException('Unable to determine authenticated user.');
    }

    const authUrl = this.youtubeService.generateAuthUrl(user.id);
    return res.redirect(authUrl);
  }

  @Get('auth/url')
  @UseGuards(RolesGuard)
  @Roles('user', 'admin')
  @ApiBearerAuth()
  authUrl(@CurrentUser() user: UserType) {
    if (!user?.id) {
      throw new BadRequestException('Unable to determine authenticated user.');
    }
    const url = this.youtubeService.generateAuthUrl(user.id);
    return { url };
  }

  @Get('channels')
  @UseGuards(RolesGuard)
  @Roles('user', 'admin')
  @ApiBearerAuth()
  channels(@CurrentUser() user: UserType) {
    return this.youtubeService.getUserChannels(user.id);
  }

  @Get('channel-info')
  @UseGuards(RolesGuard)
  @Roles('user', 'admin')
  @ApiBearerAuth()
  channelInfo(@CurrentUser() user: UserType) {
    return this.youtubeService.getChannelInfo(user.id);
  }

  @Get('callback')
  async callback(
    @Res() res: Response,
    @Query('code') code: string,
    @Query('state') state: string,
    @Query('error') error?: string,
  ) {
    console.log('\n\n++++++=', code);

    if (error) {
      return res.redirect(
        `${process.env.FRONTEND_URL || 'http://localhost:4200'}/youtube/callback?error=${error}`,
      );
    }

    if (!code) {
      return res.redirect(
        `${process.env.FRONTEND_URL || 'http://localhost:4200'}/youtube/callback?error=missing_code`,
      );
    }

    if (!state) {
      return res.redirect(
        `${process.env.FRONTEND_URL || 'http://localhost:4200'}/youtube/callback?error=missing_state`,
      );
    }

    try {
      const channel = await this.youtubeService.handleYoutubeCallback(
        state,
        code,
      );
      return res.redirect(
        `${process.env.FRONTEND_URL || 'http://localhost:4200'}/youtube/callback?channelId=${channel.channelId}&channelName=${encodeURIComponent(channel.name)}`,
      );
    } catch (e) {
      const msg = e?.message ?? 'callback_failed';
      return res.redirect(
        `${process.env.FRONTEND_URL || 'http://localhost:4200'}/youtube/callback?error=${encodeURIComponent(msg)}`,
      );
    }
  }

  @Post('upload')
  @UseGuards(RolesGuard)
  @Roles('user', 'admin')
  @ApiBearerAuth()
  upload(@CurrentUser() user: UserType, @Body() dto: UploadYoutubeDto) {
    return this.youtubeService.uploadVideo(user.id, dto.metadataId);
  }
}
