import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { Metadata } from 'src/common/models/metadata.model';
import { MetadataStatus } from 'src/common/enums/metadata-status.enum';

@Injectable()
export class MetadataManagementService {
  private isAdmin(user: { role: string }): boolean {
    return user.role === 'admin';
  }

  async findAll(user: { id: string; role: string }): Promise<Metadata[]> {
    if (this.isAdmin(user)) {
      return Metadata.findAll({ order: [['created_at', 'DESC']] });
    }
    return Metadata.findAll({
      where: {
        userId: user.id,
      },
      order: [['created_at', 'DESC']],
    });
  }

  async findOne(
    id: string,
    user: { id: string; role: string },
  ): Promise<Metadata> {
    const metadata = await Metadata.findByPk(id, { raw: true });
    if (!metadata) {
      throw new NotFoundException(`Metadata with ID ${id} not found`);
    }
    if (!this.isAdmin(user) && metadata.userId !== user.id) {
      throw new ForbiddenException('You do not have access to this metadata');
    }
    return metadata;
  }

  async update(
    id: string,
    data: {
      title?: string;
      description?: string;
      tags?: string[];
      category_id?: string;
      default_language?: string;
      privacy_status?: string;
      status?: MetadataStatus;
      publish_at?: string;
      self_declared_made_for_kids?: boolean;
    },
  ): Promise<Metadata> {
    const metadata = await Metadata.findByPk(id);
    if (!metadata) {
      throw new NotFoundException(`Metadata with ID ${id} not found`);
    }

    const updatePayload: Partial<Metadata> = {};
    if (data.title !== undefined) updatePayload.title = data.title;
    if (data.description !== undefined)
      updatePayload.description = data.description;
    if (data.tags !== undefined) updatePayload.tags = data.tags;
    if (data.category_id !== undefined)
      updatePayload.category_id = data.category_id;
    if (data.default_language !== undefined)
      updatePayload.default_language = data.default_language;
    if (data.privacy_status !== undefined)
      updatePayload.privacy_status = data.privacy_status;
    if (data.status !== undefined) updatePayload.status = data.status;
    if (data.publish_at !== undefined)
      updatePayload.publish_at = new Date(data.publish_at);
    if (data.self_declared_made_for_kids !== undefined)
      updatePayload.self_declared_made_for_kids =
        data.self_declared_made_for_kids;

    await metadata.update(updatePayload);
    return metadata;
  }

  async remove(id: string, user: { id: string; role: string }): Promise<void> {
    const metadata = await Metadata.findByPk(id);
    if (!metadata) {
      throw new NotFoundException(`Metadata with ID ${id} not found`);
    }
    if (!this.isAdmin(user) && metadata.dataValues.userId !== user.id) {
      throw new ForbiddenException(
        'You do not have permission to delete this metadata',
      );
    }
    await metadata.destroy();
  }
}
