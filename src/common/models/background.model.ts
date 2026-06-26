import { Table, Column, Model, DataType, BelongsTo, ForeignKey } from 'sequelize-typescript';
import { User } from './user.model';
import { BackgroundType } from '../enums/bg-type.enum';
import { Visibility } from '../enums/visibility.enum';

@Table({
  tableName: 'backgrounds',
  timestamps: true,
  underscored: true,
})
export class Background extends Model {
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
    defaultValue: BackgroundType.PORTRAIT,
  })
  type!: BackgroundType;

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
