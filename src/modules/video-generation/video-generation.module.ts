import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { CommonModule } from 'src/common/common.module';
import { VideoGenerationService } from './video-generation.service';
import { VideoGenerationController } from './video-generation.controller';
import { HtmlToImageService } from './services/html-to-image.service';
import { ImageToVideoService } from './services/image-to-video.service';
import { AudioService } from './services/audio.service';
import { BackgroundImageProvider } from './services/background-image.provider';
import { CerebrasService } from 'src/common/services/cerebras.service';
import { Channel } from 'src/common/models/channel.model';
import { User } from 'src/common/models/user.model';
import { Template } from 'src/common/models/template.model';

@Module({
  imports: [
    SequelizeModule.forFeature([Channel, Template]),
    SequelizeModule.forFeature([User]),
    CommonModule,
  ],
  controllers: [VideoGenerationController],
  providers: [
    VideoGenerationService,
    HtmlToImageService,
    ImageToVideoService,
    AudioService,
    BackgroundImageProvider,
    CerebrasService,
  ],
  exports: [VideoGenerationService],
})
export class VideoGenerationModule {}
