import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { VideoContent } from 'src/common/models/video-content.model';

@Injectable()
export class ContentManagementService {
  async create(data: {
    title: string;
    content: string;
    type?: string;
    userId: string;
  }): Promise<VideoContent> {
    if (!data.title || !data.content) {
      throw new BadRequestException('Title and content are required');
    }
    return VideoContent.create({
      title: data.title,
      content: data.content,
      type: data.type,
    });
  }

  async findAll(): Promise<VideoContent[]> {
    return VideoContent.findAll({ order: [['created_at', 'DESC']] });
  }

  async findOne(id: string): Promise<VideoContent> {
    const record = await VideoContent.findByPk(id, { raw: true });
    if (!record) {
      throw new NotFoundException(`Content with ID ${id} not found`);
    }
    return record;
  }

  async update(
    id: string,
    data: { title?: string; content?: string; type?: string },
  ): Promise<VideoContent> {
    const record = await VideoContent.findByPk(id);
    if (!record) {
      throw new NotFoundException(`Content with ID ${id} not found`);
    }
    await record.update(data);
    return record;
  }

  async remove(id: string): Promise<void> {
    const record = await VideoContent.findByPk(id);
    if (!record) {
      throw new NotFoundException(`Content with ID ${id} not found`);
    }
    await record.destroy();
  }
}
