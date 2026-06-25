import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({
  tableName: 'subscribe_images',
  timestamps: true,
  underscored: true,
})
export class SubscribeImage extends Model {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: DataType.UUIDV4,
  })
  declare id: string;

  @Column({ type: DataType.STRING })
  name!: string;

  @Column({ type: DataType.STRING })
  path!: string;

  @Column({ type: DataType.INTEGER })
  size!: number;

  @Column({
    type: DataType.STRING,
    values: ['portrait', 'landscape'],
    defaultValue: 'portrait',
  })
  type!: 'portrait' | 'landscape';
}
