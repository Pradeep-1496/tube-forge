import { Table, Column, Model, DataType } from 'sequelize-typescript';
import { UserRole } from '../enums/user-role.enum';

@Table({
  tableName: 'users',
  timestamps: true,
  underscored: true,
})
export class Users extends Model {
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
  name!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  email!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  password!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    values: [UserRole.USER, UserRole.ADMIN],
    defaultValue: UserRole.USER,
  })
  role!: UserRole;
}
