import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { CommonModule } from 'src/common/common.module';
import { ChannelManagementService } from './channel-management.service';
import { ChannelManagementController } from './channel-management.controller';
import { Channel } from 'src/common/models/channel.model';
import { User } from 'src/common/models/user.model';

@Module({
  imports: [
    SequelizeModule.forFeature([Channel]),
    SequelizeModule.forFeature([User]),
    CommonModule,
  ],
  controllers: [ChannelManagementController],
  providers: [ChannelManagementService],
})
export class ChannelManagementModule {}
