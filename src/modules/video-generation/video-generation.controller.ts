import { Controller, Param, Post, Body, Get, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { VideoGenerationService } from './video-generation.service';
import { GenerateVideoDto } from './dto/generate-video.dto';
import { GenerateFromVideoDto } from './dto/generate-from-video.dto';
import { GenerateVideoFromTemplateDto } from './dto/generate-video-from-template.dto';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import {
  LogActivity,
  ActivityAction,
} from 'src/common/decorators/log-activity.decorator';
import { GenerateVideoFromTemplateContentDto } from './dto/generate-video-from-template-content.dto';

interface UserPlain {
  id: string;
  name: string;
  email: string;
  role: string;
}

@ApiTags('video-generation')
@Controller('video-generation')
@UseGuards(RolesGuard)
@Roles('user', 'admin')
@ApiBearerAuth()
export class VideoGenerationController {
  constructor(
    private readonly videoGenerationService: VideoGenerationService,
  ) {}

  @Post('generate/:id')
  @LogActivity({
    action: ActivityAction.GENERATE_VIDEO,
    resourceType: 'video_generation',
    extractResourceId: (result) => (result as { id?: string })?.id || null,
  })
  @ApiOperation({
    summary:
      'Generate a 15-second video from video content ID (10s main + 5s subscribe image if subscribeImageId provided)',
  })
  @ApiParam({
    name: 'id',
    description: 'VideoContent ID to generate video from',
  })
  @ApiBody({ type: GenerateVideoDto })
  generateVideo(
    @CurrentUser() user: UserPlain,
    @Param('id') id: string,
    @Body() dto: GenerateVideoDto,
  ) {
    return this.videoGenerationService.generateVideo(user, id, dto);
  }

  @Post('generate-from-video/:videoContentId/:backgroundVideoId')
  @LogActivity({
    action: ActivityAction.GENERATE_VIDEO_FROM_BACKGROUND,
    resourceType: 'video_generation',
    extractResourceId: (result) => (result as { id?: string })?.id || null,
  })
  @ApiOperation({
    summary:
      'Generate a 15-second video from video content + background video + optional audio + theme (10s main + 5s subscribe image if subscribeImageId provided)',
  })
  @ApiParam({
    name: 'videoContentId',
    description: 'VideoContent ID to generate video from',
  })
  @ApiParam({
    name: 'backgroundVideoId',
    description: 'Background video ID to use as canvas',
  })
  @ApiBody({ type: GenerateFromVideoDto })
  generateVideoFromBackgroundVideo(
    @CurrentUser() user: UserPlain,
    @Param('videoContentId') videoContentId: string,
    @Param('backgroundVideoId') backgroundVideoId: string,
    @Body() dto: GenerateFromVideoDto,
  ) {
    return this.videoGenerationService.generateVideoFromBackgroundVideo(
      user,
      videoContentId,
      backgroundVideoId,
      dto?.audioId,
      dto?.theme,
      dto?.subscribeImageId,
      dto?.channelId,
      dto?.publishedDate,
    );
  }

  @Post('generate-from-template/:templateId')
  @LogActivity({
    action: ActivityAction.GENERATE_VIDEO_FROM_TEMPLATE,
    resourceType: 'video_generation',
    extractResourceId: (result) => (result as { id?: string })?.id || null,
  })
  @ApiOperation({
    summary:
      'Generate a 15-second video from a template ID by injecting custom content into {{content}} (supports background image or video + audio)',
  })
  @ApiParam({
    name: 'templateId',
    description: 'Template ID to generate video from',
  })
  @ApiBody({ type: GenerateVideoFromTemplateDto })
  generateVideoFromTemplate(
    @CurrentUser() user: UserPlain,
    @Param('templateId') templateId: string,
    @Body() dto: GenerateVideoFromTemplateDto,
  ) {
    return this.videoGenerationService.generateVideoFromTemplate(
      user,
      templateId,
      dto,
    );
  }

  @Post('generate-from-template/:templateId/:contentId')
  @LogActivity({
    action: ActivityAction.GENERATE_VIDEO_FROM_TEMPLATE,
    resourceType: 'video_generation',
    extractResourceId: (result) => (result as { id?: string })?.id || null,
  })
  @ApiParam({
    name: 'templateId',
    description: 'Template ID to generate video from',
  })
  @ApiParam({
    name: 'contentId',
    description: 'Content ID to generate video from content',
  })
  @ApiBody({ type: GenerateVideoFromTemplateContentDto })
  generateVideoFromContent(
    @CurrentUser() user: UserPlain,
    @Param('templateId') templateId: string,
    @Param('contentId') contentId: string,
    @Body() dto: GenerateVideoFromTemplateContentDto,
  ) {
    return this.videoGenerationService.generateVideoFromTemplateContent(
      user,
      templateId,
      contentId,
      dto,
    );
  }

  @Get('themes')
  @ApiOperation({ summary: 'Get all available theme names' })
  getThemes() {
    return this.videoGenerationService.getAvailableThemes();
  }
}
