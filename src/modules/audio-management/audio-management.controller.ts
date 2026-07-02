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
import { AudioManagementService } from './audio-management.service';
import { CreateAudioDto } from './dto/create-audio.dto';
import { Audio } from 'src/common/models/audio.model';
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

@ApiTags('audios')
@Controller('audios')
@UseGuards(RolesGuard)
@Roles('user', 'admin')
@ApiBearerAuth()
export class AudioManagementController {
  constructor(
    private readonly audioManagementService: AudioManagementService,
  ) {}

  @Post('upload')
  @LogActivity({
    action: ActivityAction.UPLOAD_AUDIO,
    resourceType: 'audio',
    extractResourceId: (result) => (result as { id?: string })?.id || null,
  })
  @ApiOperation({ summary: 'Upload a new audio file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateAudioDto })
  @ApiResponse({
    status: 201,
    description: 'Audio uploaded successfully',
    type: Audio,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body('name') name: string,
    @CurrentUser() user: UserPlain,
    @Body('visibility') visibility?: string,
  ) {
    if (!name) {
      throw new BadRequestException('Name is required');
    }
    return this.audioManagementService.create(file, name, user.id, visibility);
  }

  @Get()
  @ApiOperation({ summary: 'Get all audio files' })
  @ApiResponse({
    status: 200,
    description: 'List of all audios',
    type: [Audio],
  })
  async findAll(@CurrentUser() user: UserPlain) {
    return this.audioManagementService.findAll(user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get audio by ID' })
  @ApiParam({ name: 'id', description: 'Audio ID' })
  @ApiResponse({
    status: 200,
    description: 'Audio details',
    type: Audio,
  })
  @ApiResponse({ status: 404, description: 'Audio not found' })
  async findOne(@Param('id') id: string, @CurrentUser() user: UserPlain) {
    return this.audioManagementService.findOne(id, user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete audio file' })
  @ApiParam({ name: 'id', description: 'Audio ID' })
  @ApiResponse({ status: 200, description: 'Audio deleted successfully' })
  @ApiResponse({ status: 404, description: 'Audio not found' })
  async remove(@Param('id') id: string, @CurrentUser() user: UserPlain) {
    await this.audioManagementService.remove(id, user);
    return { message: 'Audio deleted successfully' };
  }
}
