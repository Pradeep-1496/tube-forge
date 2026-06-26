import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { SequelizeModule } from '@nestjs/sequelize';
import { CommonModule } from 'src/common/common.module';
import { BackgroundVideoManagementService } from './background-video-management.service';
import { BackgroundVideoManagementController } from './background-video-management.controller';
import { User } from 'src/common/models/user.model';

@Module({
  imports: [
    MulterModule.register({
      limits: {
        fileSize: 100 * 1024 * 1024,
      },
    }),
    SequelizeModule.forFeature([User]),
    CommonModule,
  ],
  controllers: [BackgroundVideoManagementController],
  providers: [BackgroundVideoManagementService],
})
export class BackgroundVideoManagementModule {}
