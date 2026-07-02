import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBody,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { TemplateManagementService } from './template-management.service';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';
import { Template } from 'src/common/models/template.model';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import {
  LogActivity,
  ActivityAction,
} from 'src/common/decorators/log-activity.decorator';

interface UserPlain {
  id: string;
  name: string;
  email: string;
  role: string;
}

@ApiTags('templates')
@Controller('templates')
@UseGuards(RolesGuard)
@Roles('user', 'admin')
@ApiBearerAuth()
export class TemplateManagementController {
  constructor(
    private readonly templateManagementService: TemplateManagementService,
  ) {}

  @Post()
  @LogActivity({
    action: ActivityAction.CREATE_TEMPLATE,
    resourceType: 'template',
    extractResourceId: (result) => (result as { id?: string })?.id || null,
  })
  @ApiOperation({ summary: 'Create new template' })
  @ApiBody({ type: CreateTemplateDto })
  @ApiResponse({
    status: 201,
    description: 'Template created successfully',
    type: Template,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async create(@CurrentUser() user: UserPlain, @Body() dto: CreateTemplateDto) {
    return this.templateManagementService.create({
      ...dto,
      userId: user.id,
    });
  }

  @Get()
  @ApiOperation({ summary: 'Get all templates' })
  @ApiResponse({
    status: 200,
    description: 'List of all templates',
    type: [Template],
  })
  async findAll(@CurrentUser() user: UserPlain) {
    return this.templateManagementService.findAll(user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get template by ID' })
  @ApiParam({ name: 'id', description: 'Template ID' })
  @ApiResponse({
    status: 200,
    description: 'Template details',
    type: Template,
  })
  @ApiResponse({ status: 404, description: 'Template not found' })
  async findOne(@Param('id') id: string, @CurrentUser() user: UserPlain) {
    return this.templateManagementService.findOne(id, user);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update template by ID' })
  @ApiParam({ name: 'id', description: 'Template ID' })
  @ApiBody({ type: UpdateTemplateDto })
  @ApiResponse({
    status: 200,
    description: 'Template updated successfully',
    type: Template,
  })
  @ApiResponse({ status: 404, description: 'Template not found' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateTemplateDto,
    @CurrentUser() user: UserPlain,
  ) {
    return this.templateManagementService.update(id, dto, user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete template by ID' })
  @ApiParam({ name: 'id', description: 'Template ID' })
  @ApiResponse({ status: 200, description: 'Template deleted successfully' })
  @ApiResponse({ status: 404, description: 'Template not found' })
  async remove(@Param('id') id: string, @CurrentUser() user: UserPlain) {
    await this.templateManagementService.remove(id, user);
    return { message: 'Template deleted successfully' };
  }
}
