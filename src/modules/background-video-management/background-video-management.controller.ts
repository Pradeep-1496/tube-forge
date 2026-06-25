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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBody,
  ApiConsumes,
  ApiResponse,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { BackgroundVideoManagementService } from './background-video-management.service';
import { CreateBackgroundVideoDto } from './dto/create-background-video.dto';
import { BackgroundVideo } from 'src/common/models/background-video.model';

@ApiTags('background-videos')
@Controller('background-videos')
export class BackgroundVideoManagementController {
  constructor(
    private readonly backgroundVideoManagementService: BackgroundVideoManagementService,
  ) {}

  @Post('upload')
  @ApiOperation({ summary: 'Upload a new background video' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateBackgroundVideoDto })
  @ApiResponse({
    status: 201,
    description: 'Background video uploaded successfully',
    type: BackgroundVideo,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body('name') name: string,
    @Body('type') type?: string,
  ) {
    if (!name) {
      throw new BadRequestException('Name is required');
    }
    return this.backgroundVideoManagementService.create(
      file,
      name,
      type as 'portrait' | 'landscape',
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all background videos' })
  @ApiResponse({
    status: 200,
    description: 'List of all background videos',
    type: [BackgroundVideo],
  })
  async findAll() {
    return this.backgroundVideoManagementService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get background video by ID' })
  @ApiParam({ name: 'id', description: 'Background video ID' })
  @ApiResponse({
    status: 200,
    description: 'Background video details',
    type: BackgroundVideo,
  })
  @ApiResponse({ status: 404, description: 'Background video not found' })
  async findOne(@Param('id') id: string) {
    return this.backgroundVideoManagementService.findOne(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete background video' })
  @ApiParam({ name: 'id', description: 'Background video ID' })
  @ApiResponse({
    status: 200,
    description: 'Background video deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Background video not found' })
  async remove(@Param('id') id: string) {
    await this.backgroundVideoManagementService.remove(id);
    return { message: 'Background video deleted successfully' };
  }
}
