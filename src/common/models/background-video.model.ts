import {
  Table,
  Column,
  Model,
  DataType,
  BelongsTo,
  ForeignKey,
} from 'sequelize-typescript';
import { User } from './user.model';
import { BackgroundVideoType } from '../enums/background-video-type.enum';
import { Visibility } from '../enums/visibility.enum';

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

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  userId!: string;

  @BelongsTo(() => User)
  user!: User;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    values: [Visibility.PUBLIC, Visibility.PRIVATE],
    defaultValue: Visibility.PRIVATE,
  })
  visibility!: Visibility;
}
