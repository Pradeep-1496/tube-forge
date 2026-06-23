import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { VideoGenerationService } from './video-generation.service';
import { CreateVideoGenerationDto } from './dto/create-video-generation.dto';
import { UpdateVideoGenerationDto } from './dto/update-video-generation.dto';

@Controller('video-generation')
export class VideoGenerationController {
  constructor(private readonly videoGenerationService: VideoGenerationService) {}

  @Post()
  create(@Body() createVideoGenerationDto: CreateVideoGenerationDto) {
    return this.videoGenerationService.create(createVideoGenerationDto);
  }

  @Get()
  findAll() {
    return this.videoGenerationService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.videoGenerationService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateVideoGenerationDto: UpdateVideoGenerationDto) {
    return this.videoGenerationService.update(id, updateVideoGenerationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.videoGenerationService.remove(id);
  }
}
