import { Module } from '@nestjs/common';
import { VideoGenerationService } from './video-generation.service';
import { VideoGenerationController } from './video-generation.controller';

@Module({
  controllers: [VideoGenerationController],
  providers: [VideoGenerationService],
})
export class VideoGenerationModule {}
