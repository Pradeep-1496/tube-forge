import { Module } from '@nestjs/common';
import { CommonModule } from 'src/common/common.module';
import { YoutubeController } from './youtube.controller';
import { YoutubeService } from './youtube.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from 'src/common/models/user.model';
import { Channel } from 'src/common/models/channel.model';
import { Metadata } from 'src/common/models/metadata.model';

@Module({
  imports: [
    SequelizeModule.forFeature([User, Channel, Metadata]),
    CommonModule,
  ],
  controllers: [YoutubeController],
  providers: [YoutubeService],
  exports: [YoutubeService],
})
export class YoutubeModule {}
