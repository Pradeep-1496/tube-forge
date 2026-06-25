import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { SubscribeImageManagementService } from './subscribe-image-management.service';
import { SubscribeImageManagementController } from './subscribe-image-management.controller';

@Module({
  imports: [
    MulterModule.register({
      limits: {
        fileSize: 10 * 1024 * 1024,
      },
    }),
  ],
  controllers: [SubscribeImageManagementController],
  providers: [SubscribeImageManagementService],
})
export class SubscribeImageManagementModule {}
