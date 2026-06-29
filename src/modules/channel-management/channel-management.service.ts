import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { Channel } from 'src/common/models/channel.model';

@Injectable()
export class ChannelManagementService {
  private isAdmin(user: { role: string }): boolean {
    return user.role === 'admin';
  }

  async create(data: {
    name: string;
    channelId: string;
    clientId: string;
    clientSecret: string;
    accessToken?: string;
    refreshToken?: string;
    expiryDate?: number;
    userId: string;
  }): Promise<Channel> {
    if (!data.userId) {
      throw new BadRequestException('userId is required');
    }
    return Channel.create({
      name: data.name,
      channelId: data.channelId,
      clientId: data.clientId,
      clientSecret: data.clientSecret,
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      expiryDate: data.expiryDate,
      userId: data.userId,
    });
  }

  async findAll(user: { id: string; role: string }): Promise<Channel[]> {
    if (this.isAdmin(user)) {
      return Channel.findAll({ order: [['created_at', 'DESC']] });
    }
    return Channel.findAll({
      where: { userId: user.id },
      order: [['created_at', 'DESC']],
    });
  }

  async findOne(
    id: string,
    user: { id: string; role: string },
  ): Promise<Channel> {
    const record = await Channel.findByPk(id);
    if (!record) {
      throw new NotFoundException(`Channel with ID ${id} not found`);
    }
    if (!this.isAdmin(user) && record.userId !== user.id) {
      throw new ForbiddenException('You do not have access to this channel');
    }
    return record;
  }

  async update(
    id: string,
    data: {
      name?: string;
      channelId?: string;
      clientId?: string;
      clientSecret?: string;
      accessToken?: string;
      refreshToken?: string;
      expiryDate?: number;
    },
    user: { id: string; role: string },
  ): Promise<Channel> {
    const record = await Channel.findByPk(id);
    if (!record) {
      throw new NotFoundException(`Channel with ID ${id} not found`);
    }
    if (!this.isAdmin(user) && record.userId !== user.id) {
      throw new ForbiddenException(
        'You do not have permission to update this channel',
      );
    }
    await record.update(data);
    return record;
  }

  async remove(id: string, user: { id: string; role: string }): Promise<void> {
    const record = await Channel.findByPk(id);
    if (!record) {
      throw new NotFoundException(`Channel with ID ${id} not found`);
    }
    if (!this.isAdmin(user) && record.userId !== user.id) {
      throw new ForbiddenException(
        'You do not have permission to delete this channel',
      );
    }
    await record.destroy();
  }
}
