import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsIn,
} from 'class-validator';
import { Visibility } from 'src/common/enums/visibility.enum';

export class CreateMetadataDto {
  @ApiProperty({
    example: 'My Video Title',
    description: 'Title for the metadata',
  })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({
    example: 'Description of the content',
    description: 'Description of the content',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: ['tag1', 'tag2'],
    description: 'Tags associated with the content',
    required: false,
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiProperty({
    example: '2026-06-25-1782365457255.mp4',
    description: 'File name of the media',
    required: false,
  })
  @IsOptional()
  @IsString()
  file_name?: string;

  @ApiProperty({
    example: '22',
    description: 'Category ID (YouTube category 1-44)',
    required: false,
  })
  @IsOptional()
  @IsString()
  category_id?: string;

  @ApiProperty({
    example: 'en',
    description: 'Default language code',
    required: false,
  })
  @IsOptional()
  @IsString()
  default_language?: string;

  @ApiProperty({
    example: 'private',
    description: 'Privacy status of the content',
    required: false,
  })
  @IsOptional()
  @IsString()
  privacy_status?: string;

  @ApiProperty({
    example: '2025-08-01T10:00:00Z',
    description: 'Publish date and time in ISO format',
    required: true,
  })
  @IsDateString()
  publish_at!: string;

  @ApiProperty({
    example: false,
    description: 'Whether the content is made for kids',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  self_declared_made_for_kids?: boolean;

  @ApiProperty({
    example: 'UCXuqSBlHAE6Xw-yeJA0Tunw',
    description: 'YouTube channel ID',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  channelId!: string;

  @ApiProperty({
    example: 'bbccce9c-64e9-491e-a94d-63fc6318218d',
    description: 'Video content ID to associate this metadata with',
    required: false,
  })
  @IsOptional()
  @IsString()
  contentId?: string;

  @ApiProperty({
    enum: [Visibility.PUBLIC, Visibility.PRIVATE],
    default: Visibility.PRIVATE,
    description: 'Visibility of the metadata',
    required: false,
  })
  @IsOptional()
  @IsIn([Visibility.PUBLIC, Visibility.PRIVATE])
  visibility?: Visibility;
}
