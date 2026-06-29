import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { VideoContent } from 'src/common/models/video-content.model';
import { Visibility } from 'src/common/enums/visibility.enum';
import { Op } from 'sequelize';
import { User } from 'src/common/models/user.model';

@Injectable()
export class ContentManagementService {
  private isAdmin(user: { role: string }): boolean {
    return user.role === 'admin';
  }

  async create(data: {
    title: string;
    content: string;
    type?: string;
    userId: string;
    visibility?: Visibility;
  }): Promise<VideoContent> {
    if (!data.title || !data.content) {
      throw new BadRequestException('Title and content are required');
    }
    return VideoContent.create({
      title: data.title,
      content: data.content,
      type: data.type,
      userId: data.userId,
      visibility: data.visibility || Visibility.PRIVATE,
    });
  }

  async findAll(user: { id: string; role: string }): Promise<VideoContent[]> {
    if (this.isAdmin(user)) {
      return VideoContent.findAll({
        order: [['created_at', 'DESC']],
        include: [{ model: User, attributes: ['name'] }],
      });
    }
    return VideoContent.findAll({
      where: {
        [Op.or]: [{ userId: user.id }, { visibility: Visibility.PUBLIC }],
      },
      order: [['created_at', 'DESC']],
      include: [{ model: User, attributes: ['name'] }],
    });
  }

  async findOne(
    id: string,
    user: { id: string; role: string },
  ): Promise<VideoContent> {
    const record = await VideoContent.findByPk(id);
    if (!record) {
      throw new NotFoundException(`Content with ID ${id} not found`);
    }
    if (
      !this.isAdmin(user) &&
      record.userId !== user.id &&
      record.visibility !== Visibility.PUBLIC
    ) {
      throw new ForbiddenException('You do not have access to this content');
    }
    return record;
  }

  async update(
    id: string,
    data: {
      title?: string;
      content?: string;
      type?: string;
      visibility?: Visibility;
    },
    user: { id: string; role: string },
  ): Promise<VideoContent> {
    const record = await VideoContent.findByPk(id);
    if (!record) {
      throw new NotFoundException(`Content with ID ${id} not found`);
    }
    if (!this.isAdmin(user) && record.userId !== user.id) {
      throw new ForbiddenException(
        'You do not have permission to update this content',
      );
    }
    await record.update(data);
    return record;
  }

  async remove(id: string, user: { id: string; role: string }): Promise<void> {
    const record = await VideoContent.findByPk(id);
    if (!record) {
      throw new NotFoundException(`Content with ID ${id} not found`);
    }
    if (!this.isAdmin(user) && record.userId !== user.id) {
      throw new ForbiddenException(
        'You do not have permission to delete this content',
      );
    }
    await record.destroy();
  }
}
