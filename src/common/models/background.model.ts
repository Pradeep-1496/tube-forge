import { Table, Column, Model, DataType } from 'sequelize-typescript';
import { BackgroundType } from '../enums/bg-type.enum';

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
  @Column({
    type: DataType.STRING,
    values: ['portrait', 'landscape'],
    defaultValue: BackgroundType.PORTRAIT,
  })
  type!: BackgroundType;
}
