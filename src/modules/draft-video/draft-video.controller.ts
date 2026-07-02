import {
  Controller,
  Param,
  Post,
  Body,
  Get,
  Put,
  Delete,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBody,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { DraftVideo } from 'src/common/models/draft-video.model';
import { DraftVideoService } from './draft-video.service';
import { GenerateVideoDto } from 'src/modules/video-generation/dto/generate-video.dto';
import { GenerateFromVideoDto } from 'src/modules/video-generation/dto/generate-from-video.dto';
import { UpdateDraftVideoDto } from './dto/update-draft-video.dto';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import {
  LogActivity,
  ActivityAction,
} from 'src/common/decorators/log-activity.decorator';

interface UserPlain {
  id: string;
  name: string;
  email: string;
  role: string;
}

@ApiTags('draft-video')
@Controller('draft-video')
@UseGuards(RolesGuard)
@Roles('user', 'admin')
@ApiBearerAuth()
export class DraftVideoController {
  constructor(private readonly draftVideoService: DraftVideoService) {}

  @Get()
  @ApiOperation({ summary: 'Get all draft videos' })
  @ApiResponse({
    status: 200,
    description: 'List of draft videos',
    type: [DraftVideo],
  })
  async findAll(@CurrentUser() user: UserPlain) {
    return this.draftVideoService.findAll(user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get draft video by ID' })
  @ApiParam({ name: 'id', description: 'Draft video ID' })
  @ApiResponse({
    status: 200,
    description: 'Draft video details',
    type: DraftVideo,
  })
  @ApiResponse({ status: 404, description: 'Draft video not found' })
  async findOne(@Param('id') id: string, @CurrentUser() user: UserPlain) {
    return this.draftVideoService.findOne(id, user);
  }

  @Post('from-content/:videoContentId')
  @LogActivity({
    action: ActivityAction.CREATE_DRAFT_FROM_CONTENT,
    resourceType: 'draft_video',
    extractResourceId: (result) => (result as { id?: string })?.id || null,
  })
  @ApiOperation({
    summary:
      'Create a draft record for video generation from a VideoContent ID',
  })
  @ApiParam({
    name: 'videoContentId',
    description: 'VideoContent ID to generate video from',
  })
  @ApiBody({ type: GenerateVideoDto })
  createDraftFromContent(
    @CurrentUser() user: UserPlain,
    @Param('videoContentId') videoContentId: string,
    @Body() dto: GenerateVideoDto,
  ) {
    return this.draftVideoService.createDraftFromContent(
      user,
      videoContentId,
      dto,
    );
  }

  @Post('from-background/:videoContentId/:backgroundVideoId')
  @LogActivity({
    action: ActivityAction.CREATE_DRAFT_FROM_BACKGROUND,
    resourceType: 'draft_video',
    extractResourceId: (result) => (result as { id?: string })?.id || null,
  })
  @ApiOperation({
    summary:
      'Create a draft record for video generation from VideoContent + BackgroundVideo',
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
  createDraftFromBackgroundVideo(
    @CurrentUser() user: UserPlain,
    @Param('videoContentId') videoContentId: string,
    @Param('backgroundVideoId') backgroundVideoId: string,
    @Body() dto: GenerateFromVideoDto,
  ) {
    return this.draftVideoService.createDraftFromBackgroundVideo(
      user,
      videoContentId,
      backgroundVideoId,
      dto,
    );
  }

  @Post(':id/generate')
  @LogActivity({
    action: ActivityAction.GENERATE_FROM_DRAFT,
    resourceType: 'draft_video',
    extractResourceId: () => null,
  })
  @ApiOperation({
    summary: 'Generate video from draft video ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Draft video ID',
  })
  async generateFromDraft(
    @CurrentUser() user: UserPlain,
    @Param('id') id: string,
  ) {
    return this.draftVideoService.generateVideoFromDraft(user, id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update draft video by ID' })
  @ApiParam({ name: 'id', description: 'Draft video ID' })
  @ApiBody({ type: UpdateDraftVideoDto })
  @ApiResponse({
    status: 200,
    description: 'Draft video updated successfully',
    type: DraftVideo,
  })
  @ApiResponse({ status: 404, description: 'Draft video not found' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateDraftVideoDto,
    @CurrentUser() user: UserPlain,
  ) {
    return this.draftVideoService.update(id, dto, user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete draft video by ID' })
  @ApiParam({ name: 'id', description: 'Draft video ID' })
  @ApiResponse({ status: 200, description: 'Draft video deleted successfully' })
  @ApiResponse({ status: 404, description: 'Draft video not found' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async remove(@Param('id') id: string, @CurrentUser() user: UserPlain) {
    await this.draftVideoService.remove(id, user);
    return { message: 'Draft video deleted successfully' };
  }
}
