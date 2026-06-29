import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsArray,
  IsDateString,
  IsIn,
} from 'class-validator';
import { MetadataStatus } from 'src/common/enums/metadata-status.enum';

export class UpdateMetadataDto {
  @ApiPropertyOptional({
    example: 'My Video Title',
    description: 'Title for the metadata',
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({
    example: 'Description of the content',
    description: 'Description of the content',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    example: ['tag1', 'tag2'],
    description: 'Tags associated with the content',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({
    example: '22',
    description: 'Category ID',
  })
  @IsOptional()
  @IsString()
  category_id?: string;

  @ApiPropertyOptional({
    example: 'en',
    description: 'Default language code',
  })
  @IsOptional()
  @IsString()
  default_language?: string;

  @ApiPropertyOptional({
    example: 'private',
    description: 'Privacy status of the content',
  })
  @IsOptional()
  @IsString()
  privacy_status?: string;

  @ApiPropertyOptional({
    enum: MetadataStatus,
    default: MetadataStatus.DRAFT,
    description: 'Metadata status',
    required: false,
  })
  @IsOptional()
  @IsIn([
    MetadataStatus.DRAFT,
    MetadataStatus.GENERATED,
    MetadataStatus.SCHEDULED,
    MetadataStatus.UPLOADED,
  ])
  status?: MetadataStatus;

  @ApiPropertyOptional({
    example: '2025-08-01T10:00:00Z',
    description: 'Publish date and time in ISO format',
  })
  @IsOptional()
  @IsDateString()
  publish_at?: string;

  @ApiPropertyOptional({
    example: false,
    description: 'Whether the content is made for kids',
  })
  @IsOptional()
  @IsBoolean()
  self_declared_made_for_kids?: boolean;
}
