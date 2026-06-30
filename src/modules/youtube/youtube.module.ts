import { Module } from '@nestjs/common';
import { YoutubeController } from './youtube.controller';

@Module({
  imports: [YoutubeController],
})
export class YoutubeModule {}
