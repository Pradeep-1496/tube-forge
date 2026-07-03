import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsDateString } from 'class-validator';

export class GenerateVideoFromTemplateContentDto {
  @ApiPropertyOptional({
    description: 'Background image ID from the backgrounds collection',
    example: 'bbccce9c-64e9-491e-a94d-63fc6318218d',
  })
  @IsOptional()
  @IsString()
  backgroundId?: string;

  @ApiPropertyOptional({
    description: 'Background video ID from the background-videos collection',
    example: 'a1b2c3d4-1234-1234-1234-abcdef123456',
  })
  @IsOptional()
  @IsString()
  backgroundVideoId?: string;

  @ApiPropertyOptional({
    description: 'Audio ID from the audios collection',
    example: 'a1b2c3d4-1234-1234-1234-abcdef123456',
  })
  @IsOptional()
  @IsString()
  audioId?: string;

  @ApiPropertyOptional({
    description: 'Subscribe image ID from the subscribe-images collection',
    example: 'ccddeeff-1234-1234-1234-abcdef123456',
  })
  @IsOptional()
  @IsString()
  subscribeImageId?: string;

  @ApiProperty({
    description: 'YouTube channel ID to associate with this video',
    example: 'UCXuqSBlHAE6Xw-yeJA0Tunw',
  })
  @IsString()
  channelId!: string;

  @ApiProperty({
    description: 'Published date for the video in ISO format',
    example: '2026-06-26T12:00:00Z',
  })
  @IsDateString()
  publishedDate!: string;
}
