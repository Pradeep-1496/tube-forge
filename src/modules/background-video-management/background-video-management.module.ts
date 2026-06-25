import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { BackgroundVideoManagementService } from './background-video-management.service';
import { BackgroundVideoManagementController } from './background-video-management.controller';

@Module({
  imports: [
    MulterModule.register({
      limits: {
        fileSize: 100 * 1024 * 1024,
      },
    }),
  ],
  controllers: [BackgroundVideoManagementController],
  providers: [BackgroundVideoManagementService],
})
export class BackgroundVideoManagementModule {}
