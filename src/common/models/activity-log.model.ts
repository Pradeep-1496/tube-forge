import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({
  tableName: 'activity_logs',
  timestamps: true,
  underscored: true,
})
export class ActivityLog extends Model {
  @Column({
    type: DataType.UUID,
    allowNull: true,
  })
  userId!: string | null;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  action!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  resourceType!: string;

  @Column({
    type: DataType.UUID,
    allowNull: true,
  })
  resourceId!: string | null;

  @Column({
    type: DataType.JSONB,
    allowNull: true,
  })
  details!: Record<string, unknown>;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  method!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  route!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  ipAddress!: string;
}
