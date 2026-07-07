import { Module } from '@nestjs/common';
import { CommonModule } from 'src/common/common.module';
import { YoutubeController } from './youtube.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from 'src/common/models/user.model';

@Module({
  imports: [SequelizeModule.forFeature([User]), CommonModule],
  controllers: [YoutubeController],
})
export class YoutubeModule {}
