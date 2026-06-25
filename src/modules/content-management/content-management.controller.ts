import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBody,
  ApiResponse,
} from '@nestjs/swagger';
import { ContentManagementService } from './content-management.service';
import { CreateContentDto } from './dto/create-content.dto';
import { UpdateContentDto } from './dto/update-content.dto';
import { VideoContent } from 'src/common/models/video-content.model';

@ApiTags('content')
@Controller('content')
export class ContentManagementController {
  constructor(
    private readonly contentManagementService: ContentManagementService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create new content' })
  @ApiBody({ type: CreateContentDto })
  @ApiResponse({
    status: 201,
    description: 'Content created successfully',
    type: VideoContent,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async create(@Body() dto: CreateContentDto) {
    return this.contentManagementService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all content records' })
  @ApiResponse({
    status: 200,
    description: 'List of all content',
    type: [VideoContent],
  })
  async findAll() {
    return this.contentManagementService.findAll();
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
  async findOne(@Param('id') id: string) {
    return this.contentManagementService.findOne(id);
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
  async update(@Param('id') id: string, @Body() dto: UpdateContentDto) {
    return this.contentManagementService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete content by ID' })
  @ApiParam({ name: 'id', description: 'Content ID' })
  @ApiResponse({ status: 200, description: 'Content deleted successfully' })
  @ApiResponse({ status: 404, description: 'Content not found' })
  async remove(@Param('id') id: string) {
    await this.contentManagementService.remove(id);
    return { message: 'Content deleted successfully' };
  }
}
