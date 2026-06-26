import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Channel } from 'src/common/models/channel.model';

@Injectable()
export class ChannelManagementService {
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

  async findAll(userId?: string): Promise<Channel[]> {
    const where = userId ? { userId } : {};
    return Channel.findAll({
      where,
      order: [['created_at', 'DESC']],
    });
  }

  async findOne(id: string): Promise<Channel> {
    const record = await Channel.findByPk(id, { raw: true });
    if (!record) {
      throw new NotFoundException(`Channel with ID ${id} not found`);
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
  ): Promise<Channel> {
    const record = await Channel.findByPk(id);
    if (!record) {
      throw new NotFoundException(`Channel with ID ${id} not found`);
    }
    await record.update(data);
    return record;
  }

  async remove(id: string): Promise<void> {
    const record = await Channel.findByPk(id);
    if (!record) {
      throw new NotFoundException(`Channel with ID ${id} not found`);
    }
    await record.destroy();
  }
}
