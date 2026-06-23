import { Injectable, NotFoundException } from '@nestjs/common';
import { Metadata } from '../../common/models/metadata.model';
import { CreateVideoGenerationDto } from './dto/create-video-generation.dto';
import { UpdateVideoGenerationDto } from './dto/update-video-generation.dto';

@Injectable()
export class VideoGenerationService {
  async create(
    createVideoGenerationDto: CreateVideoGenerationDto,
  ): Promise<Metadata> {
    const metadata = await Metadata.create(
      createVideoGenerationDto as Partial<Metadata>,
    );
    return metadata;
  }

  async findAll(): Promise<Metadata[]> {
    return Metadata.findAll();
  }

  async findOne(id: string): Promise<Metadata> {
    const metadata = await Metadata.findByPk(id);
    if (!metadata) {
      throw new NotFoundException(`Metadata with ID ${id} not found`);
    }
    return metadata;
  }

  async update(
    id: string,
    updateVideoGenerationDto: UpdateVideoGenerationDto,
  ): Promise<Metadata> {
    const metadata = await this.findOne(id);
    await metadata.update(updateVideoGenerationDto);
    return metadata;
  }

  async remove(id: string): Promise<void> {
    const metadata = await this.findOne(id);
    await metadata.destroy();
  }
}
