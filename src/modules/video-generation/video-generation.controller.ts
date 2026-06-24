import { Controller, Param, Post } from '@nestjs/common';
import { VideoGenerationService } from './video-generation.service';

@Controller('video-generation')
export class VideoGenerationController {
  constructor(
    private readonly videoGenerationService: VideoGenerationService,
  ) {}

  @Post('generate/:id')
  generateVideo(@Param('id') id: string) {
    return this.videoGenerationService.generateVideo(id);
  }
}
