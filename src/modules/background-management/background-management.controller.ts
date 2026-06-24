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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiConsumes,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { BackgroundManagementService } from './background-management.service';
import { CreateBackgroundDto } from './dto/create-background.dto';
import { BackgroundType } from 'src/common/enums/bg-type.enum';

@ApiTags('backgrounds')
@Controller('backgrounds')
export class BackgroundManagementController {
  constructor(
    private readonly backgroundManagementService: BackgroundManagementService,
  ) {}

  @Post('upload')
  @ApiOperation({ summary: 'Upload a new background image' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateBackgroundDto })
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body('name') name: string,
    @Body('type') type?: BackgroundType,
  ) {
    if (!name) {
      throw new BadRequestException('Name is required');
    }
    return this.backgroundManagementService.create(file, name, type);
  }

  @Get()
  @ApiOperation({ summary: 'Get all background images' })
  async findAll() {
    return this.backgroundManagementService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get background image by ID' })
  @ApiParam({ name: 'id', description: 'Background ID' })
  async findOne(@Param('id') id: string) {
    return this.backgroundManagementService.findOne(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete background image' })
  @ApiParam({ name: 'id', description: 'Background ID' })
  async remove(@Param('id') id: string) {
    await this.backgroundManagementService.remove(id);
    return { message: 'Background deleted successfully' };
  }
}
