import { Module } from '@nestjs/common';
import { VideoGenerationService } from './video-generation.service';
import { VideoGenerationController } from './video-generation.controller';
import { HtmlToImageService } from './services/html-to-image.service';
import { ImageToVideoService } from './services/image-to-video.service';

@Module({
  controllers: [VideoGenerationController],
  providers: [VideoGenerationService, HtmlToImageService, ImageToVideoService],
})
export class VideoGenerationModule {}
