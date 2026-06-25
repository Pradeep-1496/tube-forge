import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Metadata } from 'src/common/models/metadata.model';

@Injectable()
export class ContentManagementService {
  async create(data: { title: string; content: string; type?: string }): Promise<Metadata> {
    if (!data.title || !data.content) {
      throw new BadRequestException('Title and content are required');
    }
    return Metadata.create({
      title: data.title,
      content: data.content,
      type: data.type,
    });
  }

  async findAll(): Promise<Metadata[]> {
    return Metadata.findAll({ order: [['created_at', 'DESC']] });
  }

  async findOne(id: string): Promise<Metadata> {
    const record = await Metadata.findByPk(id, { raw: true });
    if (!record) {
      throw new NotFoundException(`Content with ID ${id} not found`);
    }
    return record;
  }

  async update(id: string, data: { title?: string; content?: string; type?: string }): Promise<Metadata> {
    const record = await Metadata.findByPk(id);
    if (!record) {
      throw new NotFoundException(`Content with ID ${id} not found`);
    }
    await record.update(data);
    return record;
  }

  async remove(id: string): Promise<void> {
    const record = await Metadata.findByPk(id);
    if (!record) {
      throw new NotFoundException(`Content with ID ${id} not found`);
    }
    await record.destroy();
  }
}
