import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBody,
  ApiConsumes,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { BackgroundVideoManagementService } from './background-video-management.service';
import { CreateBackgroundVideoDto } from './dto/create-background-video.dto';
import { BackgroundVideo } from 'src/common/models/background-video.model';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import {
  LogActivity,
  ActivityAction,
} from 'src/common/decorators/log-activity.decorator';
import type { UserType } from 'src/common/types/user.type';

@ApiTags('background-videos')
@Controller('background-videos')
@UseGuards(RolesGuard)
@Roles('user', 'admin')
@ApiBearerAuth()
export class BackgroundVideoManagementController {
  constructor(
    private readonly backgroundVideoManagementService: BackgroundVideoManagementService,
  ) {}

  @Post('upload')
  @LogActivity({
    action: ActivityAction.UPLOAD_BACKGROUND_VIDEO,
    resourceType: 'background_video',
    extractResourceId: (result) => (result as { id?: string })?.id || null,
  })
  @ApiOperation({ summary: 'Upload a new background video' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateBackgroundVideoDto })
  @ApiResponse({
    status: 201,
    description: 'Background video uploaded successfully',
    type: BackgroundVideo,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body('name') name: string,
    @CurrentUser() user: UserType,
    @Body('type') type?: string,
    @Body('visibility') visibility?: string,
  ) {
    if (!name) {
      throw new BadRequestException('Name is required');
    }
    return this.backgroundVideoManagementService.create(
      file,
      name,
      user.id,
      type as 'portrait' | 'landscape',
      visibility,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all background videos' })
  @ApiResponse({
    status: 200,
    description: 'List of all background videos',
    type: [BackgroundVideo],
  })
  async findAll(@CurrentUser() user: UserType) {
    return this.backgroundVideoManagementService.findAll(user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get background video by ID' })
  @ApiParam({ name: 'id', description: 'Background video ID' })
  @ApiResponse({
    status: 200,
    description: 'Background video details',
    type: BackgroundVideo,
  })
  @ApiResponse({ status: 404, description: 'Background video not found' })
  async findOne(@Param('id') id: string, @CurrentUser() user: UserType) {
    return this.backgroundVideoManagementService.findOne(id, user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete background video' })
  @ApiParam({ name: 'id', description: 'Background video ID' })
  @ApiResponse({
    status: 200,
    description: 'Background video deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Background video not found' })
  async remove(@Param('id') id: string, @CurrentUser() user: UserType) {
    await this.backgroundVideoManagementService.remove(id, user);
    return { message: 'Background video deleted successfully' };
  }
}
