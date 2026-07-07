import {
  Controller,
  Get,
  Query,
  Param,
  UseGuards,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiQuery,
  ApiParam,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { ActivityLogService } from './activity-log.service';
import { ActivityLog } from 'src/common/models/activity-log.model';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import type { UserType } from 'src/common/types/user.type';

@ApiTags('activity-log')
@Controller('activity-log')
@UseGuards(RolesGuard)
@Roles('user', 'admin')
@ApiBearerAuth()
export class ActivityLogController {
  constructor(private readonly activityLogService: ActivityLogService) {}

  @Get('timeline')
  @ApiOperation({
    summary: 'Get the current user activity timeline (newest first)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Max results (default 100, max 500)',
  })
  @ApiResponse({
    status: 200,
    description: 'Activity timeline',
    type: [ActivityLog],
  })
  async getTimeline(
    @CurrentUser() user: UserType,
    @Query('limit') limit?: string,
  ): Promise<ActivityLog[]> {
    const maxLimit = Math.min(Number(limit) || 100, 500);

    return this.activityLogService.findByUserId(user.id, maxLimit);
  }

  @Get()
  @ApiOperation({
    summary: 'List all activity logs (admin: all / user: own only)',
  })
  @ApiQuery({
    name: 'action',
    required: false,
    description: 'Filter by action',
  })
  @ApiQuery({
    name: 'resourceType',
    required: false,
    description: 'Filter by resource type',
  })
  @ApiQuery({
    name: 'userId',
    required: false,
    description: 'Filter by user ID (admin only)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Max results (default 100, max 500)',
  })
  @ApiResponse({
    status: 200,
    description: 'Activity log list',
    type: [ActivityLog],
  })
  async findAll(
    @CurrentUser() user: UserType,
    @Query('action') action?: string,
    @Query('resourceType') resourceType?: string,
    @Query('userId') userId?: string,
    @Query('limit') limit?: string,
  ): Promise<ActivityLog[]> {
    const maxLimit = Math.min(Number(limit) || 100, 500);
    const targetUserId = user.role === 'admin' ? userId || undefined : user.id;
    if (userId && user.role !== 'admin') {
      throw new BadRequestException('You cannot query logs for another user');
    }
    return this.activityLogService.findAll({
      userId: targetUserId,
      action,
      resourceType,
      limit: maxLimit,
    });
  }

  @Get('entries/:id')
  @ApiOperation({ summary: 'Get a single activity log entry by ID' })
  @ApiParam({ name: 'id', description: 'Activity log entry ID' })
  @ApiResponse({
    status: 200,
    description: 'Activity log entry',
    type: ActivityLog,
  })
  @ApiResponse({ status: 404, description: 'Activity log not found' })
  async findOne(
    @CurrentUser() user: UserType,
    @Param('id') id: string,
  ): Promise<ActivityLog> {
    const log = await this.activityLogService.findOne(id);
    if (!log) {
      throw new NotFoundException('Activity log entry not found');
    }
    if (user.role !== 'admin' && log.userId !== user.id) {
      throw new NotFoundException('Activity log entry not found');
    }
    return log;
  }
}
