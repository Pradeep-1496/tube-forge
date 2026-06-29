import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { DraftVideoService } from './draft-video.service';
import { DraftVideoController } from './draft-video.controller';
import { CommonModule } from 'src/common/common.module';
import { DraftVideo } from 'src/common/models/draft-video.model';
import { VideoContent } from 'src/common/models/video-content.model';
import { BackgroundVideo } from 'src/common/models/background-video.model';
import { Background } from 'src/common/models/background.model';
import { Audio } from 'src/common/models/audio.model';
import { SubscribeImage } from 'src/common/models/subscribe-image.model';
import { User } from 'src/common/models/user.model';
import { Channel } from 'src/common/models/channel.model';
import { VideoGenerationModule } from 'src/modules/video-generation/video-generation.module';

@Module({
  imports: [
    SequelizeModule.forFeature([
      DraftVideo,
      VideoContent,
      BackgroundVideo,
      Background,
      Audio,
      SubscribeImage,
      User,
      Channel,
    ]),
    CommonModule,
    VideoGenerationModule,
  ],
  controllers: [DraftVideoController],
  providers: [DraftVideoService],
  exports: [DraftVideoService],
})
export class DraftVideoModule {}
