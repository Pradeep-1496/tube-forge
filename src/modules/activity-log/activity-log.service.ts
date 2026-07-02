import { Injectable } from '@nestjs/common';
import { ActivityLog } from 'src/common/models/activity-log.model';

@Injectable()
export class ActivityLogService {
  async create(data: {
    userId: string | null;
    action: string;
    resourceType: string;
    resourceId: string | null;
    details?: Record<string, unknown>;
    method?: string;
    route?: string;
    ipAddress?: string | null;
  }): Promise<ActivityLog> {
    const userId = data.userId;
    const detailsPayload = data.details
      ? (JSON.parse(JSON.stringify(data.details)) as Record<string, unknown>)
      : undefined;

    return ActivityLog.create({
      userId,
      action: data.action,
      resourceType: data.resourceType,
      resourceId: data.resourceId,
      details: detailsPayload,
      method: data.method,
      route: data.route,
      ipAddress: data.ipAddress,
    });
  }

  async findOne(id: string): Promise<ActivityLog | null> {
    return ActivityLog.findByPk(id);
  }

  async findByUserId(userId: string, limit = 100): Promise<ActivityLog[]> {
    return ActivityLog.findAll({
      where: { userId },
      order: [['created_at', 'DESC']],
      limit,
    });
  }

  async findAll(filters: {
    userId?: string;
    action?: string;
    resourceType?: string;
    limit?: number;
  }): Promise<ActivityLog[]> {
    const where: Record<string, unknown> = {};
    if (filters.userId) {
      where.userId = filters.userId;
    }
    if (filters.action) {
      where.action = filters.action;
    }
    if (filters.resourceType) {
      where.resourceType = filters.resourceType;
    }

    return ActivityLog.findAll({
      where,
      order: [['created_at', 'DESC']],
      limit: filters.limit || 100,
    });
  }
}
