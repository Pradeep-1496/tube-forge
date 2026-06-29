import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsDateString } from 'class-validator';

export class GenerateVideoFromTemplateDto {
  @ApiProperty({
    description:
      'Content string to inject into {{content}} placeholder (e.g. "quote text --author")',
    example: 'this is a quote --xyz',
  })
  @IsString()
  content!: string;

  @ApiPropertyOptional({
    description: 'Title for the generated video. Defaults to template name.',
    example: 'My Quote Video',
  })
  @IsOptional()
  @IsString()
  title?: string;

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
    description: 'Theme key to use for the video template',
    example: 'neon',
    enum: [
      'glassmorphism',
      'neon',
      'viral',
      'apple',
      'gold',
      'none',
      'custom',
      'news',
    ],
  })
  @IsOptional()
  @IsString()
  theme?: string;

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
