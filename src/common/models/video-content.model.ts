import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({
  tableName: 'video_content',
  timestamps: true,
  underscored: true,
})
export class VideoContent extends Model {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: DataType.UUIDV4,
  })
  declare id: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  title!: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  content!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  type!: string;
}
