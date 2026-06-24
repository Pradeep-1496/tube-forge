import { Table, Column, Model, DataType } from 'sequelize-typescript';

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
}
