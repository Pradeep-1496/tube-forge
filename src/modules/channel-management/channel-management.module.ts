import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ChannelManagementService } from './channel-management.service';
import { ChannelManagementController } from './channel-management.controller';
import { Channel } from 'src/common/models/channel.model';

@Module({
  imports: [SequelizeModule.forFeature([Channel])],
  controllers: [ChannelManagementController],
  providers: [ChannelManagementService],
})
export class ChannelManagementModule {}
