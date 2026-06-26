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
  tableName: 'templates',
  timestamps: true,
  underscored: true,
})
export class Template extends Model {
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
  name!: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  description!: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  code!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    values: [Visibility.PUBLIC, Visibility.PRIVATE],
    defaultValue: Visibility.PRIVATE,
  })
  visibility!: Visibility;

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
}
