import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { CommonModule } from 'src/common/common.module';
import { TemplateManagementService } from './template-management.service';
import { TemplateManagementController } from './template-management.controller';
import { User } from 'src/common/models/user.model';

@Module({
  imports: [CommonModule, SequelizeModule.forFeature([User])],
  controllers: [TemplateManagementController],
  providers: [TemplateManagementService],
})
export class TemplateManagementModule {}
