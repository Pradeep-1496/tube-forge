import {
  Table,
  Column,
  Model,
  DataType,
  BelongsTo,
  ForeignKey,
} from 'sequelize-typescript';
import { User } from './user.model';
import { Visibility } from '../enums/visibility.enum';

@Table({
  tableName: 'audios',
  timestamps: true,
  underscored: true,
})
export class Audio extends Model {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: DataType.UUIDV4,
  })
  declare audio_id: string;

  @Column({ type: DataType.STRING, allowNull: false })
  name!: string;

  @Column({ type: DataType.STRING, allowNull: false })
  path!: string;

  @Column({ type: DataType.FLOAT })
  length!: number;

  @Column({ type: DataType.INTEGER })
  size!: number;

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
