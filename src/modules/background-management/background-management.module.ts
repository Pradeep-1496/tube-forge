import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { BackgroundManagementService } from './background-management.service';
import { BackgroundManagementController } from './background-management.controller';

@Module({
  imports: [
    MulterModule.register({
      limits: {
        fileSize: 10 * 1024 * 1024,
      },
    }),
  ],
  controllers: [BackgroundManagementController],
  providers: [BackgroundManagementService],
})
export class BackgroundManagementModule {}
