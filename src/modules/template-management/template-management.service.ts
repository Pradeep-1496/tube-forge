import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { Template } from 'src/common/models/template.model';
import { Visibility } from 'src/common/enums/visibility.enum';
import { Op } from 'sequelize';

@Injectable()
export class TemplateManagementService {
  private isAdmin(user: { role: string }): boolean {
    return user.role === 'admin';
  }

  async create(data: {
    name: string;
    description?: string;
    code?: string;
    userId: string;
    visibility?: Visibility;
  }): Promise<Template> {
    if (!data.name) {
      throw new BadRequestException('Name is required');
    }

    const existing = await Template.findOne({ where: { name: data.name } });
    if (existing) {
      throw new BadRequestException(
        `Template with name ${data.name} already exists`,
      );
    }

    return Template.create({
      name: data.name,
      description: data.description,
      code: data.code,
      userId: data.userId,
      visibility: data.visibility || Visibility.PRIVATE,
    });
  }

  async findAll(user: { id: string; role: string }): Promise<Template[]> {
    if (this.isAdmin(user)) {
      return Template.findAll({ order: [['created_at', 'DESC']] });
    }
    return Template.findAll({
      where: {
        [Op.or]: [{ userId: user.id }, { visibility: Visibility.PUBLIC }],
      },
      order: [['created_at', 'DESC']],
    });
  }

  async findOne(
    id: string,
    user: { id: string; role: string },
  ): Promise<Template> {
    const record = await Template.findByPk(id);
    if (!record) {
      throw new NotFoundException(`Template with ID ${id} not found`);
    }
    if (
      !this.isAdmin(user) &&
      record.userId !== user.id &&
      record.visibility !== Visibility.PUBLIC
    ) {
      throw new ForbiddenException('You do not have access to this template');
    }
    return record;
  }

  async update(
    id: string,
    data: {
      name?: string;
      description?: string;
      code?: string;
      visibility?: Visibility;
    },
    user: { id: string; role: string },
  ): Promise<Template> {
    const record = await Template.findByPk(id);
    if (!record) {
      throw new NotFoundException(`Template with ID ${id} not found`);
    }
    if (!this.isAdmin(user) && record.userId !== user.id) {
      throw new ForbiddenException(
        'You do not have permission to update this template',
      );
    }

    if (data.name && data.name !== record.name) {
      const existing = await Template.findOne({ where: { name: data.name } });
      if (existing) {
        throw new BadRequestException(
          `Template with name ${data.name} already exists`,
        );
      }
    }

    await record.update(data);
    return record;
  }

  async remove(id: string, user: { id: string; role: string }): Promise<void> {
    const record = await Template.findByPk(id);
    if (!record) {
      throw new NotFoundException(`Template with ID ${id} not found`);
    }
    if (!this.isAdmin(user) && record.userId !== user.id) {
      throw new ForbiddenException(
        'You do not have permission to delete this template',
      );
    }
    await record.destroy();
  }
}
