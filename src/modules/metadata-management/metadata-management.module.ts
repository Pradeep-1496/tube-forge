import { Module } from '@nestjs/common';
import { MetadataManagementService } from './metadata-management.service';
import { MetadataManagementController } from './metadata-management.controller';

@Module({
  imports: [],
  controllers: [MetadataManagementController],
  providers: [MetadataManagementService],
})
export class MetadataManagementModule {}
