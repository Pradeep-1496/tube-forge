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
import { UpdateBackgroundDto } from './dto/update-background.dto';
import { BackgroundType } from 'src/common/enums/bg-type.enum';
import { Background } from 'src/common/models/background.model';

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
    @Body('type') type?: BackgroundType,
  ) {
    if (!name) {
      throw new BadRequestException('Name is required');
    }
    return this.backgroundManagementService.create(file, name, type);
  }

  @Get()
  @ApiOperation({ summary: 'Get all background images' })
  @ApiResponse({
    status: 200,
    description: 'List of all backgrounds',
    type: [Background],
  })
  async findAll() {
    return this.backgroundManagementService.findAll();
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
  async findOne(@Param('id') id: string) {
    return this.backgroundManagementService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update background image' })
  @ApiParam({ name: 'id', description: 'Background ID' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UpdateBackgroundDto })
  @ApiResponse({
    status: 200,
    description: 'Background updated successfully',
    type: Background,
  })
  @ApiResponse({ status: 404, description: 'Background not found' })
  @UseInterceptors(FileInterceptor('file'))
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateBackgroundDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.backgroundManagementService.update(
      id,
      updateDto.name,
      updateDto.type,
      file,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete background image' })
  @ApiParam({ name: 'id', description: 'Background ID' })
  @ApiResponse({ status: 200, description: 'Background deleted successfully' })
  @ApiResponse({ status: 404, description: 'Background not found' })
  async remove(@Param('id') id: string) {
    await this.backgroundManagementService.remove(id);
    return { message: 'Background deleted successfully' };
  }
}
