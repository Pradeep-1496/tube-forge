import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { SequelizeModule } from '@nestjs/sequelize';
import { CommonModule } from 'src/common/common.module';
import { SubscribeImageManagementService } from './subscribe-image-management.service';
import { SubscribeImageManagementController } from './subscribe-image-management.controller';
import { User } from 'src/common/models/user.model';

@Module({
  imports: [
    MulterModule.register({
      limits: {
        fileSize: 10 * 1024 * 1024,
      },
    }),
    SequelizeModule.forFeature([User]),
    CommonModule,
  ],
  controllers: [SubscribeImageManagementController],
  providers: [SubscribeImageManagementService],
})
export class SubscribeImageManagementModule {}
