import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { CommonModule } from 'src/common/common.module';
import { ContentManagementService } from './content-management.service';
import { ContentManagementController } from './content-management.controller';
import { User } from 'src/common/models/user.model';

@Module({
  imports: [CommonModule, SequelizeModule.forFeature([User])],
  controllers: [ContentManagementController],
  providers: [ContentManagementService],
})
export class ContentManagementModule {}
