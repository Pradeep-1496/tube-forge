/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';
import { ActivityLogService } from 'src/modules/activity-log/activity-log.service';
import { Request } from 'express';
import { LOG_ACTIVITY_KEY } from 'src/common/decorators/log-activity.decorator';

@Injectable()
export class ActivityLogInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly activityLogService: ActivityLogService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const metadata = this.reflector.get<{
      action: string;
      resourceType: string;
      extractResourceId?: (result: unknown) => string | null;
    }>(LOG_ACTIVITY_KEY, context.getHandler());

    if (!metadata) {
      return next.handle();
    }

    const req = context.switchToHttp().getRequest<Request>();
    const { action, resourceType, extractResourceId } = metadata;
    const user = req.user as Record<string, unknown> | undefined;
    const method = req.method;
    const routePath: string = req.route?.path ?? req.url;
    const ipAddress: string | null =
      req.ip ?? req.connection?.remoteAddress ?? null;

    return next.handle().pipe(
      mergeMap(async (result: unknown) => {
        let resourceId: string | null = null;
        if (extractResourceId) {
          resourceId = extractResourceId(result);
        } else if (result && typeof result === 'object') {
          const r = result as Record<string, unknown>;
          resourceId = (r.id as string) || null;
        }

        const details: Record<string, unknown> = {};
        if (result && typeof result === 'object' && !resourceId) {
          details.summary = JSON.stringify(result).slice(0, 500);
        }

        const userId = (user?.id as string) || null;
        await this.activityLogService.create({
          userId,
          action,
          resourceType,
          resourceId,
          details,
          method,
          route: routePath,
          ipAddress: ipAddress || null,
        });

        return result;
      }),
    );
  }
}
