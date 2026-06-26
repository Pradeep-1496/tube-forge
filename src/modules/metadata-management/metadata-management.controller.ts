import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBody,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { MetadataManagementService } from './metadata-management.service';
import { CreateMetadataDto } from './dto/create-metadata.dto';
import { Metadata } from 'src/common/models/metadata.model';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';

@ApiTags('metadata')
@Controller('metadata')
@UseGuards(RolesGuard)
@Roles('user', 'admin')
@ApiBearerAuth()
export class MetadataManagementController {
  constructor(
    private readonly metadataManagementService: MetadataManagementService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create new metadata' })
  @ApiBody({ type: CreateMetadataDto })
  @ApiResponse({
    status: 201,
    description: 'Metadata created successfully',
    type: Metadata,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async create(@Body() dto: CreateMetadataDto) {
    return this.metadataManagementService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all metadata records' })
  @ApiResponse({
    status: 200,
    description: 'List of all metadata',
    type: [Metadata],
  })
  async findAll() {
    return this.metadataManagementService.findAll();
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
  async findOne(@Param('id') id: string) {
    return this.metadataManagementService.findOne(id);
  }
}
