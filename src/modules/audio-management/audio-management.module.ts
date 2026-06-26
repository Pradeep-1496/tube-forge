import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { SequelizeModule } from '@nestjs/sequelize';
import { CommonModule } from 'src/common/common.module';
import { AudioManagementService } from './audio-management.service';
import { AudioManagementController } from './audio-management.controller';
import { User } from 'src/common/models/user.model';

@Module({
  imports: [
    MulterModule.register({
      limits: {
        fileSize: 50 * 1024 * 1024,
      },
    }),
    SequelizeModule.forFeature([User]),
    CommonModule,
  ],
  controllers: [AudioManagementController],
  providers: [AudioManagementService],
  exports: [AudioManagementService],
})
export class AudioManagementModule {}
