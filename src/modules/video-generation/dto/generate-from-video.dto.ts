import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsDateString } from 'class-validator';

export class GenerateFromVideoDto {
  @ApiPropertyOptional({
    description:
      'Audio ID from the audios collection. If the audio is shorter than 15s it will be looped, if longer it will be trimmed to 15s',
    example: 'a1b2c3d4-1234-1234-1234-abcdef123456',
  })
  @IsOptional()
  @IsString()
  audioId?: string;

  @ApiPropertyOptional({
    description: 'Theme key to use for the video template',
    example: 'neutral',
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
    description:
      'Subscribe image ID from the subscribe-images collection. If provided, the video will be 10s main content + 5s subscribe image = 15s total',
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
