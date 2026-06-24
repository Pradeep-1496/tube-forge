import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { AudioManagementService } from './audio-management.service';
import { AudioManagementController } from './audio-management.controller';

@Module({
  imports: [
    MulterModule.register({
      limits: {
        fileSize: 50 * 1024 * 1024,
      },
    }),
  ],
  controllers: [AudioManagementController],
  providers: [AudioManagementService],
  exports: [AudioManagementService],
})
export class AudioManagementModule {}
