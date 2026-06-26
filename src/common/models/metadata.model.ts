import { Table, Column, Model, DataType } from 'sequelize-typescript';
import { MetadataStatus } from '../enums/metadata-status.enum';

@Table({
  tableName: 'metadata',
  timestamps: true,
  underscored: true,
})
export class Metadata extends Model {
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
    allowNull: true,
  })
  description!: string;

  @Column({
    type: DataType.JSON,
    allowNull: true,
  })
  tags!: string[];

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  file_name!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  category_id!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  default_language!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  privacy_status!: string;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  publish_at!: Date;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: true,
    defaultValue: false,
  })
  self_declared_made_for_kids!: boolean;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  output_video_path!: string;

  @Column({
    type: DataType.UUID,
    allowNull: true,
    references: {
      model: 'youtube_channels',
      key: 'id',
    },
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  })
  channelId!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    defaultValue: MetadataStatus.DRAFT,
  })
  status!: MetadataStatus;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  youtubeVideoId!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  youtubeUrl!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  thumbnailPath!: string;

  @Column({
    type: DataType.UUID,
    allowNull: true,
    references: {
      model: 'video_content',
      key: 'id',
    },
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  })
  contentId!: string;
}
