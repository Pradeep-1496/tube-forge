import { Table, Column, Model, DataType } from 'sequelize-typescript';
import { BackgroundVideoType } from '../enums/background-video-type.enum';

@Table({
  tableName: 'background_videos',
  timestamps: true,
  underscored: true,
})
export class BackgroundVideo extends Model {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: DataType.UUIDV4,
  })
  declare bg_video_id: string;

  @Column({ type: DataType.STRING })
  name!: string;

  @Column({ type: DataType.STRING })
  path!: string;

  @Column({ type: DataType.INTEGER })
  size!: number;

  @Column({
    type: DataType.STRING,
    values: ['portrait', 'landscape'],
    defaultValue: BackgroundVideoType.PORTRAIT,
  })
  type!: BackgroundVideoType;
}
