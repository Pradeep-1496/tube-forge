import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { CommonModule } from 'src/common/common.module';
import { MetadataManagementService } from './metadata-management.service';
import { MetadataManagementController } from './metadata-management.controller';
import { User } from 'src/common/models/user.model';

@Module({
  imports: [CommonModule, SequelizeModule.forFeature([User])],
  controllers: [MetadataManagementController],
  providers: [MetadataManagementService],
})
export class MetadataManagementModule {}
