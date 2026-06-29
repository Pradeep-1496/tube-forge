import {
  Table,
  Column,
  Model,
  DataType,
  BelongsTo,
  ForeignKey,
} from 'sequelize-typescript';
import { User } from './user.model';
import { Audio } from './audio.model';
import { Background } from './background.model';
import { BackgroundVideo } from './background-video.model';
import { SubscribeImage } from './subscribe-image.model';
import { VideoContent } from './video-content.model';
import { Visibility } from '../enums/visibility.enum';
import { DraftVideoStatus } from '../enums/draft-video-status.enum';

@Table({
  tableName: 'draft_videos',
  timestamps: true,
  underscored: true,
})
export class DraftVideo extends Model {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: DataType.UUIDV4,
  })
  declare id: string;

  @ForeignKey(() => VideoContent)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    references: {
      model: 'video_content',
      key: 'id',
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  contentId!: string;

  @BelongsTo(() => VideoContent)
  content!: VideoContent;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  theme!: string;

  @ForeignKey(() => Background)
  @Column({
    type: DataType.UUID,
    allowNull: true,
    references: {
      model: 'backgrounds',
      key: 'id',
    },
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  })
  backgroundId!: string | null;

  @BelongsTo(() => Background)
  background!: Background;

  @ForeignKey(() => Audio)
  @Column({
    type: DataType.UUID,
    allowNull: true,
    references: {
      model: 'audios',
      key: 'audio_id',
    },
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  })
  audioId!: string | null;

  @BelongsTo(() => Audio)
  audio!: Audio;

  @ForeignKey(() => SubscribeImage)
  @Column({
    type: DataType.UUID,
    allowNull: true,
    references: {
      model: 'subscribe_images',
      key: 'id',
    },
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  })
  subscribeImageId!: string | null;

  @BelongsTo(() => SubscribeImage)
  subscribeImage!: SubscribeImage;

  @ForeignKey(() => BackgroundVideo)
  @Column({
    type: DataType.UUID,
    allowNull: true,
    references: {
      model: 'background_videos',
      key: 'bg_video_id',
    },
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  })
  backgroundVideoId!: string | null;

  @BelongsTo(() => BackgroundVideo)
  backgroundVideo!: BackgroundVideo;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  channelId!: string;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  publishedAt!: Date | null;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    values: [
      DraftVideoStatus.PENDING,
      DraftVideoStatus.GENERATING,
      DraftVideoStatus.GENERATED,
      DraftVideoStatus.FAILED,
    ],
    defaultValue: DraftVideoStatus.PENDING,
  })
  status!: DraftVideoStatus;

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
    allowNull: true,
  })
  outputVideoPath!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  thumbnailPath!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  file_name!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    values: [Visibility.PUBLIC, Visibility.PRIVATE],
    defaultValue: Visibility.PRIVATE,
  })
  visibility!: Visibility;
}
