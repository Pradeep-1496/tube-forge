export class CreateActivityLogDto {
  userId!: string | null;
  action!: string;
  resourceType!: string;
  resourceId!: string | null;
  details?: Record<string, unknown>;
  method?: string;
  route?: string;
  ipAddress?: string | null;
}
