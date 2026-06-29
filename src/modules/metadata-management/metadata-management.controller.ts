import { Controller, Get, Put, Param, Body, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBody,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { MetadataManagementService } from './metadata-management.service';
import { UpdateMetadataDto } from './dto/update-metadata.dto';
import { Metadata } from 'src/common/models/metadata.model';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';

interface UserPlain {
  id: string;
  name: string;
  email: string;
  role: string;
}

@ApiTags('metadata')
@Controller('metadata')
@UseGuards(RolesGuard)
@Roles('user', 'admin')
@ApiBearerAuth()
export class MetadataManagementController {
  constructor(
    private readonly metadataManagementService: MetadataManagementService,
  ) {}

  @Put(':id')
  @ApiOperation({ summary: 'Update metadata' })
  @ApiBody({ type: UpdateMetadataDto })
  @ApiParam({ name: 'id', description: 'Metadata ID' })
  @ApiResponse({
    status: 200,
    description: 'Metadata updated successfully',
    type: Metadata,
  })
  @ApiResponse({ status: 404, description: 'Metadata not found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateMetadataDto,
    @CurrentUser() _user: UserPlain,
  ) {
    return this.metadataManagementService.update(id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all metadata records' })
  @ApiResponse({
    status: 200,
    description: 'List of all metadata',
    type: [Metadata],
  })
  async findAll(@CurrentUser() user: UserPlain) {
    return this.metadataManagementService.findAll(user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get metadata by ID' })
  @ApiParam({ name: 'id', description: 'Metadata ID' })
  @ApiResponse({
    status: 200,
    description: 'Metadata details',
    type: Metadata,
  })
  @ApiResponse({ status: 404, description: 'Metadata not found' })
  async findOne(@Param('id') id: string, @CurrentUser() user: UserPlain) {
    return this.metadataManagementService.findOne(id, user);
  }
}
