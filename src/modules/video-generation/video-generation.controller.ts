import {
  Controller,
  Param,
  Post,
  Body,
  Get,
} from '@nestjs/common';
import { VideoGenerationService } from './video-generation.service';
import { GenerateVideoDto } from './dto/generate-video.dto';

@Controller('video-generation')
export class VideoGenerationController {
  constructor(
    private readonly videoGenerationService: VideoGenerationService,
  ) {}

  @Post('generate/:id')
  generateVideo(
    @Param('id') id: string,
    @Body() dto: GenerateVideoDto,
  ) {
    return this.videoGenerationService.generateVideo(id, dto);
  }

  @Get('backgrounds')
  getBackgrounds() {
    return this.videoGenerationService.getAvailableBackgrounds();
  }

  @Get('themes')
  getThemes() {
    return this.videoGenerationService.getAvailableThemes();
  }
}
