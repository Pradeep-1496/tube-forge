import { Controller, Param, Post, Body, Get } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBody,
  ApiResponse,
} from '@nestjs/swagger';
import { VideoGenerationService } from './video-generation.service';
import { GenerateVideoDto } from './dto/generate-video.dto';
import { GenerateFromVideoDto } from './dto/generate-from-video.dto';

@ApiTags('video-generation')
@Controller('video-generation')
export class VideoGenerationController {
  constructor(
    private readonly videoGenerationService: VideoGenerationService,
  ) {}

  @Get('metadata')
  @ApiOperation({ summary: 'Get all video content records' })
  @ApiResponse({ status: 200, description: 'List of all video content' })
  findAll() {
    return this.videoGenerationService.findAll();
  }

  @Get('metadata/:id')
  @ApiOperation({ summary: 'Get video content by ID' })
  @ApiParam({ name: 'id', description: 'VideoContent ID' })
  findOne(@Param('id') id: string) {
    return this.videoGenerationService.findOne(id);
  }

  @Post('generate/:id')
  @ApiOperation({ summary: 'Generate a 15-second video from video content ID' })
  @ApiParam({ name: 'id', description: 'VideoContent ID to generate video from' })
  @ApiBody({ type: GenerateVideoDto })
  generateVideo(@Param('id') id: string, @Body() dto: GenerateVideoDto) {
    return this.videoGenerationService.generateVideo(id, dto);
  }

  @Post('generate-from-video/:metadataId/:backgroundVideoId')
  @ApiOperation({
    summary:
      'Generate a 15-second video from video content + background video + optional audio + theme',
  })
  @ApiParam({
    name: 'metadataId',
    description: 'VideoContent ID to generate video from',
  })
  @ApiParam({
    name: 'backgroundVideoId',
    description: 'Background video ID to use as canvas',
  })
  @ApiBody({ type: GenerateFromVideoDto })
  generateVideoFromBackgroundVideo(
    @Param('metadataId') metadataId: string,
    @Param('backgroundVideoId') backgroundVideoId: string,
    @Body() dto: GenerateFromVideoDto,
  ) {
    return this.videoGenerationService.generateVideoFromBackgroundVideo(
      metadataId,
      backgroundVideoId,
      dto?.audioId,
      dto?.theme,
    );
  }

  @Get('themes')
  @ApiOperation({ summary: 'Get all available theme names' })
  getThemes() {
    return this.videoGenerationService.getAvailableThemes();
  }
}
