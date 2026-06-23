import { Injectable } from '@nestjs/common';
import { CreateVideoGenerationDto } from './dto/create-video-generation.dto';
import { UpdateVideoGenerationDto } from './dto/update-video-generation.dto';

@Injectable()
export class VideoGenerationService {
  create(createVideoGenerationDto: CreateVideoGenerationDto) {
    return 'This action adds a new videoGeneration';
  }

  findAll() {
    return `This action returns all videoGeneration`;
  }

  findOne(id: number) {
    return `This action returns a #${id} videoGeneration`;
  }

  update(id: number, updateVideoGenerationDto: UpdateVideoGenerationDto) {
    return `This action updates a #${id} videoGeneration`;
  }

  remove(id: number) {
    return `This action removes a #${id} videoGeneration`;
  }
}
