import { Module } from '@nestjs/common';
import { CommonModule } from './common/common.module';
import { DatabaseModule } from './database/database.module';
import { VideoGenerationModule } from './modules/video-generation/video-generation.module';
import { BackgroundManagementModule } from './modules/background-management/background-management.module';
import { AudioManagementModule } from './modules/audio-management/audio-management.module';
import { BackgroundVideoManagementModule } from './modules/background-video-management/background-video-management.module';
import { ContentManagementModule } from './modules/content-management/content-management.module';
import { MetadataManagementModule } from './modules/metadata-management/metadata-management.module';
import { SubscribeImageManagementModule } from './modules/subscribe-image-management/subscribe-image-management.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AuthModule } from './modules/auth/auth.module';
import { ChannelManagementModule } from './modules/channel-management/channel-management.module';
import { TemplateManagementModule } from './modules/template-management/template-management.module';
import { AppController } from './app.controller';
import { DraftVideoModule } from './modules/draft-video/draft-video.module';

@Module({
  imports: [
    CommonModule,
    DatabaseModule,
    AuthModule,
    DraftVideoModule,
    ChannelManagementModule,
    TemplateManagementModule,
    VideoGenerationModule,
    BackgroundManagementModule,
    AudioManagementModule,
    BackgroundVideoManagementModule,
    ContentManagementModule,
    MetadataManagementModule,
    SubscribeImageManagementModule,
    ServeStaticModule.forRoot(
      {
        rootPath: join(process.cwd(), 'output-videos'),
        serveRoot: '/output-videos',
      },
      {
        rootPath: join(process.cwd(), 'assets', 'audios'),
        serveRoot: '/assets/audios',
      },
      {
        rootPath: join(process.cwd(), 'assets', 'backgrounds', 'portrait'),
        serveRoot: '/assets/backgrounds/portrait',
      },
      {
        rootPath: join(process.cwd(), 'assets', 'backgrounds', 'landscape'),
        serveRoot: '/assets/backgrounds/landscape',
      },
      {
        rootPath: join(process.cwd(), 'assets', 'bg_videos', 'portrait'),
        serveRoot: '/assets/bg_videos/portrait',
      },

      {
        rootPath: join(process.cwd(), 'assets', 'subscribe-images', 'portrait'),
        serveRoot: '/assets/subscribe-images/portrait',
      },
    ),
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
