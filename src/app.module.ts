import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { VideoGenerationModule } from './modules/video-generation/video-generation.module';

@Module({
  imports: [DatabaseModule, VideoGenerationModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
