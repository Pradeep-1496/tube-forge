import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBody,
  ApiConsumes,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { BackgroundManagementService } from './background-management.service';
import { CreateBackgroundDto } from './dto/create-background.dto';
import { Background } from 'src/common/models/background.model';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import {
  LogActivity,
  ActivityAction,
} from 'src/common/decorators/log-activity.decorator';
import type { UserType } from 'src/common/types/user.type';

@ApiTags('backgrounds')
@Controller('backgrounds')
@UseGuards(RolesGuard)
@Roles('user', 'admin')
@ApiBearerAuth()
export class BackgroundManagementController {
  constructor(
    private readonly backgroundManagementService: BackgroundManagementService,
  ) {}

  @Post('upload')
  @LogActivity({
    action: ActivityAction.UPLOAD_BACKGROUND,
    resourceType: 'background',
    extractResourceId: (result) => (result as { id?: string })?.id || null,
  })
  @ApiOperation({ summary: 'Upload a new background image' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateBackgroundDto })
  @ApiResponse({
    status: 201,
    description: 'Background uploaded successfully',
    type: Background,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body('name') name: string,
    @CurrentUser() user: UserType,
    @Body('type') type?: string,
    @Body('visibility') visibility?: string,
  ) {
    if (!name) {
      throw new BadRequestException('Name is required');
    }
    return this.backgroundManagementService.create(
      file,
      name,
      user.id,
      type as 'portrait' | 'landscape',
      visibility,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all background images' })
  @ApiResponse({
    status: 200,
    description: 'List of all backgrounds',
    type: [Background],
  })
  async findAll(@CurrentUser() user: UserType) {
    return this.backgroundManagementService.findAll(user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get background image by ID' })
  @ApiParam({ name: 'id', description: 'Background ID' })
  @ApiResponse({
    status: 200,
    description: 'Background details',
    type: Background,
  })
  @ApiResponse({ status: 404, description: 'Background not found' })
  async findOne(@Param('id') id: string, @CurrentUser() user: UserType) {
    return this.backgroundManagementService.findOne(id, user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete background image' })
  @ApiParam({ name: 'id', description: 'Background ID' })
  @ApiResponse({ status: 200, description: 'Background deleted successfully' })
  @ApiResponse({ status: 404, description: 'Background not found' })
  async remove(@Param('id') id: string, @CurrentUser() user: UserType) {
    await this.backgroundManagementService.remove(id, user);
    return { message: 'Background deleted successfully' };
  }
}
