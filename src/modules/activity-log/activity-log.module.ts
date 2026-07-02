import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { CommonModule } from 'src/common/common.module';
import { ActivityLog } from 'src/common/models/activity-log.model';
import { User } from 'src/common/models/user.model';
import { ActivityLogService } from './activity-log.service';
import { ActivityLogController } from './activity-log.controller';

@Module({
  imports: [
    SequelizeModule.forFeature([ActivityLog]),
    SequelizeModule.forFeature([User]),
    CommonModule,
  ],
  controllers: [ActivityLogController],
  providers: [ActivityLogService],
  exports: [ActivityLogService],
})
export class ActivityLogModule {}
