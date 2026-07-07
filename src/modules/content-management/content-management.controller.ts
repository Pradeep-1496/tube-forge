import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
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
import { ContentManagementService } from './content-management.service';
import { CreateContentDto } from './dto/create-content.dto';
import { UpdateContentDto } from './dto/update-content.dto';
import { VideoContent } from 'src/common/models/video-content.model';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import {
  LogActivity,
  ActivityAction,
} from 'src/common/decorators/log-activity.decorator';
import type { UserType } from 'src/common/types/user.type';

@ApiTags('content')
@Controller('content')
@UseGuards(RolesGuard)
@Roles('user', 'admin')
@ApiBearerAuth()
export class ContentManagementController {
  constructor(
    private readonly contentManagementService: ContentManagementService,
  ) {}

  @Post()
  @LogActivity({
    action: ActivityAction.CREATE_CONTENT,
    resourceType: 'video_content',
    extractResourceId: (result) => (result as { id?: string })?.id || null,
  })
  @ApiOperation({ summary: 'Create new content' })
  @ApiBody({ type: CreateContentDto })
  @ApiResponse({
    status: 201,
    description: 'Content created successfully',
    type: VideoContent,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async create(@CurrentUser() user: UserType, @Body() dto: CreateContentDto) {
    return this.contentManagementService.create({
      ...dto,
      userId: user.id,
    });
  }

  @Get()
  @ApiOperation({ summary: 'Get all content records' })
  @ApiResponse({
    status: 200,
    description: 'List of all content',
    type: [VideoContent],
  })
  async findAll(@CurrentUser() user: UserType) {
    return this.contentManagementService.findAll(user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get content by ID' })
  @ApiParam({ name: 'id', description: 'Content ID' })
  @ApiResponse({
    status: 200,
    description: 'Content details',
    type: VideoContent,
  })
  @ApiResponse({ status: 404, description: 'Content not found' })
  async findOne(@Param('id') id: string, @CurrentUser() user: UserType) {
    return this.contentManagementService.findOne(id, user);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update content by ID' })
  @ApiParam({ name: 'id', description: 'Content ID' })
  @ApiBody({ type: UpdateContentDto })
  @ApiResponse({
    status: 200,
    description: 'Content updated successfully',
    type: VideoContent,
  })
  @ApiResponse({ status: 404, description: 'Content not found' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateContentDto,
    @CurrentUser() user: UserType,
  ) {
    return this.contentManagementService.update(id, dto, user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete content by ID' })
  @ApiParam({ name: 'id', description: 'Content ID' })
  @ApiResponse({ status: 200, description: 'Content deleted successfully' })
  @ApiResponse({ status: 404, description: 'Content not found' })
  async remove(@Param('id') id: string, @CurrentUser() user: UserType) {
    await this.contentManagementService.remove(id, user);
    return { message: 'Content deleted successfully' };
  }
}
