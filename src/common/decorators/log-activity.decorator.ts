import { SetMetadata } from '@nestjs/common';
import { ActivityAction } from 'src/common/enums/activity-action.enum';

export { ActivityAction };

export interface LogActivityOptions {
  action: ActivityAction;
  resourceType: string;
  extractResourceId?: (result: unknown) => string | null;
}

export const LOG_ACTIVITY_KEY = 'activityLog';

export const LogActivity = (options: LogActivityOptions) =>
  SetMetadata(LOG_ACTIVITY_KEY, options);
