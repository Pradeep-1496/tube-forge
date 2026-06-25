import { Module } from '@nestjs/common';
import { VideoGenerationService } from './video-generation.service';
import { VideoGenerationController } from './video-generation.controller';
import { HtmlToImageService } from './services/html-to-image.service';
import { ImageToVideoService } from './services/image-to-video.service';
import { AudioService } from './services/audio.service';
import { BackgroundImageProvider } from './services/background-image.provider';
import { CerebrasService } from 'src/common/services/cerebras.service';

@Module({
  controllers: [VideoGenerationController],
  providers: [
    VideoGenerationService,
    HtmlToImageService,
    ImageToVideoService,
    AudioService,
    BackgroundImageProvider,
    CerebrasService,
  ],
})
export class VideoGenerationModule {}
