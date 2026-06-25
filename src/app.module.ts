import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { VideoGenerationModule } from './modules/video-generation/video-generation.module';
import { BackgroundManagementModule } from './modules/background-management/background-management.module';
import { AudioManagementModule } from './modules/audio-management/audio-management.module';
import { BackgroundVideoManagementModule } from './modules/background-video-management/background-video-management.module';
import { ContentManagementModule } from './modules/content-management/content-management.module';
import { MetadataManagementModule } from './modules/metadata-management/metadata-management.module';

@Module({
  imports: [
    DatabaseModule,
    VideoGenerationModule,
    BackgroundManagementModule,
    AudioManagementModule,
    BackgroundVideoManagementModule,
    ContentManagementModule,
    MetadataManagementModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
