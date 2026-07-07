import {
  Controller,
  Post,
  Get,
  Put,
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
import { SubscribeImageManagementService } from './subscribe-image-management.service';
import { CreateSubscribeImageDto } from './dto/create-subscribe-image.dto';
import { UpdateSubscribeImageDto } from './dto/update-subscribe-image.dto';
import { SubscribeImage } from 'src/common/models/subscribe-image.model';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import {
  LogActivity,
  ActivityAction,
} from 'src/common/decorators/log-activity.decorator';
import type { UserType } from 'src/common/types/user.type';

@ApiTags('subscribe-images')
@Controller('subscribe-images')
@UseGuards(RolesGuard)
@Roles('user', 'admin')
@ApiBearerAuth()
export class SubscribeImageManagementController {
  constructor(
    private readonly subscribeImageManagementService: SubscribeImageManagementService,
  ) {}

  @Post('upload')
  @LogActivity({
    action: ActivityAction.UPLOAD_SUBSCRIBE_IMAGE,
    resourceType: 'subscribe_image',
    extractResourceId: (result) => (result as { id?: string })?.id || null,
  })
  @ApiOperation({ summary: 'Upload a new subscribe image' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateSubscribeImageDto })
  @ApiResponse({
    status: 201,
    description: 'Subscribe image uploaded successfully',
    type: SubscribeImage,
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
    return this.subscribeImageManagementService.create(
      file,
      name,
      user.id,
      type as 'portrait' | 'landscape',
      visibility,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all subscribe images' })
  @ApiResponse({
    status: 200,
    description: 'List of all subscribe images',
    type: [SubscribeImage],
  })
  async findAll(@CurrentUser() user: UserType) {
    return this.subscribeImageManagementService.findAll(user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get subscribe image by ID' })
  @ApiParam({ name: 'id', description: 'Subscribe image ID' })
  @ApiResponse({
    status: 200,
    description: 'Subscribe image details',
    type: SubscribeImage,
  })
  @ApiResponse({ status: 404, description: 'Subscribe image not found' })
  async findOne(@Param('id') id: string, @CurrentUser() user: UserType) {
    return this.subscribeImageManagementService.findOne(id, user);
  }

  @Put(':id')
  @LogActivity({
    action: ActivityAction.UPDATE_SUBSCRIBE_IMAGE,
    resourceType: 'subscribe_image',
    extractResourceId: (result) => (result as { id?: string })?.id || null,
  })
  @ApiOperation({ summary: 'Update subscribe image by ID' })
  @ApiParam({ name: 'id', description: 'Subscribe image ID' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UpdateSubscribeImageDto })
  @ApiResponse({
    status: 200,
    description: 'Subscribe image updated successfully',
    type: SubscribeImage,
  })
  @ApiResponse({ status: 404, description: 'Subscribe image not found' })
  @UseInterceptors(FileInterceptor('file'))
  async update(
    @Param('id') id: string,
    @CurrentUser() user: UserType,
    @UploadedFile() file?: Express.Multer.File,
    @Body('name') name?: string,
    @Body('type') type?: string,
    @Body('visibility') visibility?: string,
  ) {
    return this.subscribeImageManagementService.update(
      id,
      {
        file,
        name,
        type: type as 'portrait' | 'landscape' | undefined,
        visibility,
      },
      user,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete subscribe image' })
  @ApiParam({ name: 'id', description: 'Subscribe image ID' })
  @ApiResponse({
    status: 200,
    description: 'Subscribe image deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Subscribe image not found' })
  async remove(@Param('id') id: string, @CurrentUser() user: UserType) {
    await this.subscribeImageManagementService.remove(id, user);
    return { message: 'Subscribe image deleted successfully' };
  }
}
