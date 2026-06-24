import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { VideoGenerationModule } from './modules/video-generation/video-generation.module';
import { BackgroundManagementModule } from './modules/background-management/background-management.module';
import { AudioManagementModule } from './modules/audio-management/audio-management.module';

@Module({
  imports: [
    DatabaseModule,
    VideoGenerationModule,
    BackgroundManagementModule,
    AudioManagementModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
