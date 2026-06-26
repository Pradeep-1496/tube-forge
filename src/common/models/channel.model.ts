import {
  Table,
  Column,
  Model,
  DataType,
  BelongsTo,
  ForeignKey,
} from 'sequelize-typescript';
import { Users } from './user.model';

@Table({
  tableName: 'youtube_channels',
  timestamps: true,
  underscored: true,
})
export class Channel extends Model {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: DataType.UUIDV4,
  })
  declare id: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  channelId!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  name!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  clientId!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  clientSecret!: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  accessToken!: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  refreshToken!: string;

  @Column({
    type: DataType.BIGINT,
    allowNull: true,
  })
  expiryDate!: number;

  @ForeignKey(() => Users)
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

  @BelongsTo(() => Users)
  user!: Users;
}
