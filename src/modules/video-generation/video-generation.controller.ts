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

@ApiTags('video-generation')
@Controller('video-generation')
export class VideoGenerationController {
  constructor(
    private readonly videoGenerationService: VideoGenerationService,
  ) {}

  @Get('metadata')
  @ApiOperation({ summary: 'Get all metadata records' })
  @ApiResponse({ status: 200, description: 'List of all metadata' })
  findAll() {
    return this.videoGenerationService.findAll();
  }

  @Get('metadata/:id')
  @ApiOperation({ summary: 'Get metadata by ID' })
  @ApiParam({ name: 'id', description: 'Metadata ID' })
  findOne(@Param('id') id: string) {
    return this.videoGenerationService.findOne(id);
  }

  @Post('generate/:id')
  @ApiOperation({ summary: 'Generate a 15-second video from metadata ID' })
  @ApiParam({ name: 'id', description: 'Metadata ID to generate video from' })
  @ApiBody({ type: GenerateVideoDto })
  generateVideo(@Param('id') id: string, @Body() dto: GenerateVideoDto) {
    return this.videoGenerationService.generateVideo(id, dto);
  }

  @Get('themes')
  @ApiOperation({ summary: 'Get all available theme names' })
  getThemes() {
    return this.videoGenerationService.getAvailableThemes();
  }
}
