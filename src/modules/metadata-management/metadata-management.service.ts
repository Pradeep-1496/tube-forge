import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Metadata } from 'src/common/models/metadata.model';

@Injectable()
export class MetadataManagementService {
  async create(data: {
    title: string;
    description?: string;
    tags?: string[];
    file_name?: string;
    category_id?: string;
    default_language?: string;
    privacy_status?: string;
    publish_at: string;
    self_declared_made_for_kids?: boolean;
    channelId: string;
    contentId?: string;
  }): Promise<Metadata> {
    if (!data.title) {
      throw new BadRequestException('Title is required');
    }

    if (!data.publish_at) {
      throw new BadRequestException('publish_at is required');
    }

    if (!data.channelId) {
      throw new BadRequestException('channelId is required');
    }

    return Metadata.create({
      title: data.title,
      description: data.description,
      tags: data.tags,
      file_name: data.file_name,
      category_id: data.category_id,
      default_language: data.default_language,
      privacy_status: data.privacy_status,
      publish_at: new Date(data.publish_at),
      self_declared_made_for_kids: data.self_declared_made_for_kids ?? false,
      channelId: data.channelId,
      contentId: data.contentId,
    });
  }

  async findAll(): Promise<Metadata[]> {
    return Metadata.findAll({ order: [['created_at', 'DESC']] });
  }

  async findOne(id: string): Promise<Metadata> {
    const metadata = await Metadata.findByPk(id, { raw: true });
    if (!metadata) {
      throw new NotFoundException(`Metadata with ID ${id} not found`);
    }
    return metadata;
  }
}
