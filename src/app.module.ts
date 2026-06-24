import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { VideoGenerationModule } from './modules/video-generation/video-generation.module';
import { BackgroundManagementModule } from './modules/background-management/background-management.module';

@Module({
  imports: [DatabaseModule, VideoGenerationModule, BackgroundManagementModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
